import { EventEmitter } from 'events';
import { promptConfirm } from './confirm';
import { promptText } from './text';

// A fake stdin: prompts only use setRawMode, resume, pause, setEncoding and 'data'.
class FakeStdin extends EventEmitter {
  setRawMode = jest.fn();
  resume = jest.fn();
  pause = jest.fn();
  setEncoding = jest.fn();

  type(...keys: string[]) {
    keys.forEach((key) => this.emit('data', key));
  }
}

let stdin: FakeStdin;
let output: string;
const originalStdin = Object.getOwnPropertyDescriptor(process, 'stdin')!;

beforeEach(() => {
  stdin = new FakeStdin();
  Object.defineProperty(process, 'stdin', { value: stdin, configurable: true });
  output = '';
  jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    output += String(chunk);
    return true;
  });
});

afterEach(() => {
  Object.defineProperty(process, 'stdin', originalStdin);
  jest.restoreAllMocks();
});

describe('key listeners', () => {
  it('leaves no listener behind once a text prompt resolves', async () => {
    const answer = promptText('Name');
    stdin.type('a', '\r');
    await answer;

    expect(stdin.listenerCount('data')).toBe(0);
  });

  it('leaves no listener behind once a confirm prompt resolves', async () => {
    const answer = promptConfirm('Sure?');
    stdin.type('y');
    await answer;

    expect(stdin.listenerCount('data')).toBe(0);
  });

  // The listener leak made every earlier prompt echo the keys of the next one:
  // a secret typed after two text prompts was printed three times.
  it('echoes a key once even after earlier prompts', async () => {
    const first = promptText('First');
    stdin.type('a', '\r');
    await first;
    const second = promptText('Second');
    stdin.type('S', '\r');

    expect(await second).toBe('S');
    expect(output).toBe('First: a\nSecond: S\n');
  });
});

describe('promptText mask', () => {
  it('never writes the typed value, only the mask character', async () => {
    const answer = promptText('Secret', { mask: true });
    stdin.type('0xab', 'c', '\r');

    expect(await answer).toBe('0xabc');
    expect(output).toBe('Secret: *****\n');
  });

  it('writes nothing at all for an empty mask', async () => {
    const answer = promptText('Secret', { mask: '' });
    stdin.type('abc', '\r');

    expect(await answer).toBe('abc');
    expect(output).toBe('Secret: \n');
  });

  it('erases one mask character per backspace', async () => {
    const answer = promptText('Secret', { mask: true });
    stdin.type('a', 'b', '\u007F', 'c', '\r');

    expect(await answer).toBe('ac');
    expect(output).toBe('Secret: **\b \b*\n');
  });

  // Erasing past the start used to eat into the prompt message itself.
  it('does not erase the prompt when the input is already empty', async () => {
    const answer = promptText('Secret', { mask: true });
    stdin.type('\u007F', 'a', '\r');

    expect(await answer).toBe('a');
    expect(output).toBe('Secret: *\n');
  });

  // Some Windows consoles send Ctrl+H (0x08) for Backspace instead of DEL (0x7F).
  it('treats Ctrl+H as a backspace', async () => {
    const answer = promptText('Secret', { mask: true });
    stdin.type('a', 'b', '\b', '\r');

    expect(await answer).toBe('a');
  });

  it('does not echo the value when validation rejects it', async () => {
    const answer = promptText('Secret', {
      mask: true,
      validate: (value) => value.length > 2 || 'Too short',
    });
    stdin.type('ab', '\r');
    await new Promise((resolve) => setImmediate(resolve)); // let the prompt loop ask again
    stdin.type('abc', '\r');

    expect(await answer).toBe('abc');
    expect(output).not.toMatch(/ab/);
  });
});
