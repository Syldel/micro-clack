import { FakeTerminal, installFakeTerminal, restoreTerminal } from '../testing/fake-terminal';
import { promptSelect } from './select';

let term: FakeTerminal;

beforeEach(() => {
  term = installFakeTerminal();
});

afterEach(() => {
  restoreTerminal();
});

describe('promptSelect', () => {
  it('returns the value of the option chosen with the arrows', async () => {
    const answer = promptSelect('Pick', [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ]);
    term.stdin.type('\u001B[B', '\r');

    expect(await answer).toBe('b');
  });

  // Enter on an empty list used to crash on `undefined.value`.
  it('refuses an empty list before drawing anything', async () => {
    await expect(promptSelect('Pick', [])).rejects.toThrow(/at least one option/);
    expect(term.output()).toBe('');
  });
});
