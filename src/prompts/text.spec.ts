import {
  FakeTerminal,
  installFakeTerminal,
  nextTurn,
  restoreTerminal,
} from '../testing/fake-terminal';
import { promptConfirm } from './confirm';
import { promptText } from './text';

let term: FakeTerminal;

beforeEach(() => {
  term = installFakeTerminal();
});

afterEach(() => {
  restoreTerminal();
});

describe('key listeners', () => {
  it('leaves no listener behind once a text prompt resolves', async () => {
    const answer = promptText('Name');
    term.stdin.type('a', '\r');
    await answer;

    expect(term.stdin.listenerCount('data')).toBe(0);
  });

  it('leaves no listener behind once a confirm prompt resolves', async () => {
    const answer = promptConfirm('Sure?');
    term.stdin.type('y');
    await answer;

    expect(term.stdin.listenerCount('data')).toBe(0);
  });

  // The listener leak made every earlier prompt echo the keys of the next one:
  // a secret typed after two text prompts was printed three times.
  it('echoes a key once even after earlier prompts', async () => {
    const first = promptText('First');
    term.stdin.type('a', '\r');
    await first;
    const second = promptText('Second');
    term.stdin.type('S', '\r');

    expect(await second).toBe('S');
    expect(term.output()).toBe('First: a\nSecond: S\n');
  });
});

describe('promptText mask', () => {
  it('never writes the typed value, only the mask character', async () => {
    const answer = promptText('Secret', { mask: true });
    term.stdin.type('0xab', 'c', '\r');

    expect(await answer).toBe('0xabc');
    expect(term.output()).toBe('Secret: *****\n');
  });

  it('writes nothing at all for an empty mask', async () => {
    const answer = promptText('Secret', { mask: '' });
    term.stdin.type('abc', '\r');

    expect(await answer).toBe('abc');
    expect(term.output()).toBe('Secret: \n');
  });

  it('erases one mask character per backspace', async () => {
    const answer = promptText('Secret', { mask: true });
    term.stdin.type('a', 'b', '\u007F', 'c', '\r');

    expect(await answer).toBe('ac');
    expect(term.output()).toBe('Secret: **\b \b*\n');
  });

  // Erasing past the start used to eat into the prompt message itself.
  it('does not erase the prompt when the input is already empty', async () => {
    const answer = promptText('Secret', { mask: true });
    term.stdin.type('\u007F', 'a', '\r');

    expect(await answer).toBe('a');
    expect(term.output()).toBe('Secret: *\n');
  });

  // Some Windows consoles send Ctrl+H (0x08) for Backspace instead of DEL (0x7F).
  it('treats Ctrl+H as a backspace', async () => {
    const answer = promptText('Secret', { mask: true });
    term.stdin.type('a', 'b', '\b', '\r');

    expect(await answer).toBe('a');
  });

  it('does not echo the value when validation rejects it', async () => {
    const answer = promptText('Secret', {
      mask: true,
      validate: (value) => value.length > 2 || 'Too short',
    });
    term.stdin.type('ab', '\r');
    await nextTurn();
    term.stdin.type('abc', '\r');

    expect(await answer).toBe('abc');
    expect(term.output()).not.toMatch(/ab/);
  });
});

describe('promptText special keys', () => {
  // An arrow, Home or Delete key arrives as an escape sequence: appended to the
  // value, it corrupted it with invisible characters.
  it('keeps escape sequences out of the value and off the screen', async () => {
    const answer = promptText('Name');
    term.stdin.type('a', '\u001B[D', '\u001B[3~', '\u001B', 'b', '\r');

    expect(await answer).toBe('ab');
    expect(term.output()).toBe('Name: ab\n');
  });
});
