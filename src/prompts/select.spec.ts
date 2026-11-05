import { FakeTerminal, installFakeTerminal, restoreTerminal } from '../testing/fake-terminal';
import { promptSelect } from './select';

let term: FakeTerminal;

beforeEach(() => {
  term = installFakeTerminal();
});

afterEach(() => {
  restoreTerminal();
});

const THREE = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
];

describe('promptSelect', () => {
  it('returns the value of the option chosen with the arrows', async () => {
    const answer = promptSelect('Pick', THREE);
    term.stdin.type('\u001B[B', '\r');

    expect(await answer).toBe('b');
  });

  // A terminal in application cursor mode sends SS3, not CSI: measured on
  // Windows on 2026-11-05, where the arrows used to do nothing at all.
  it('reads the arrows a terminal sends in application cursor mode', async () => {
    const answer = promptSelect('Pick', THREE);
    term.stdin.type('\u001BOB', '\u001BOB', '\u001BOA', '\r');

    expect(await answer).toBe('b');
  });

  it('wraps around from the first option to the last', async () => {
    const answer = promptSelect('Pick', THREE);
    term.stdin.type('\u001BOA', '\r');

    expect(await answer).toBe('c');
  });

  // The fallback no terminal can break: no escape sequence involved.
  it('moves to the option whose number is typed', async () => {
    const answer = promptSelect('Pick', THREE);
    term.stdin.type('3', '\r');

    expect(await answer).toBe('c');
  });

  // A digit only moves the cursor: a slip must not pick an option by itself.
  it('waits for Enter after a number', async () => {
    let settled = false;
    const answer = promptSelect('Pick', THREE).then(() => (settled = true));
    term.stdin.type('2');
    await new Promise((resolve) => setImmediate(resolve));

    expect(settled).toBe(false);
    term.stdin.type('\r');
    await answer;
  });

  it('ignores a number beyond the options', async () => {
    const answer = promptSelect('Pick', THREE);
    term.stdin.type('2', '7', '\r');

    expect(await answer).toBe('b');
  });

  it('numbers the options and says which keys move', async () => {
    const answer = promptSelect('Pick', THREE);
    term.stdin.type('\r');
    await answer;

    expect(term.output()).toContain('1. A');
    expect(term.output()).toContain('3. C');
    expect(term.output()).toContain('Up/Down or 1-3, then Enter');
  });

  // Only nine digits exist: the tenth option onward is reached with the arrows.
  it('numbers only the first nine options, and reaches the others by arrow', async () => {
    const twelve = Array.from({ length: 12 }, (_, i) => ({ label: `O${i + 1}`, value: i + 1 }));
    const answer = promptSelect('Pick', twelve, 12);
    term.stdin.type('9', '\u001BOB', '\r');

    expect(await answer).toBe(10);
    expect(term.output()).toContain('9. O9');
    expect(term.output()).not.toContain('10. O10');
    expect(term.output()).toContain('Up/Down or 1-9, then Enter');
  });

  // Enter on an empty list used to crash on `undefined.value`.
  it('refuses an empty list before drawing anything', async () => {
    await expect(promptSelect('Pick', [])).rejects.toThrow(/at least one option/);
    expect(term.output()).toBe('');
  });
});
