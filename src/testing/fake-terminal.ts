import { EventEmitter } from 'events';

// A fake TTY stdin: prompts only use isTTY, setRawMode, resume, pause,
// setEncoding and 'data'.
export class FakeStdin extends EventEmitter {
  isTTY: boolean | undefined = true;
  setRawMode = jest.fn();
  resume = jest.fn();
  pause = jest.fn();
  setEncoding = jest.fn();

  type(...keys: string[]) {
    keys.forEach((key) => this.emit('data', key));
  }
}

export interface FakeTerminal {
  stdin: FakeStdin;
  /** Everything written to stdout so far. */
  output(): string;
  exit: jest.SpyInstance;
}

const originalStdin = Object.getOwnPropertyDescriptor(process, 'stdin')!;

/**
 * Swaps process.stdin for a FakeStdin, records stdout and stubs process.exit.
 * Call it in beforeEach and restoreTerminal in afterEach.
 */
export function installFakeTerminal(): FakeTerminal {
  const stdin = new FakeStdin();
  Object.defineProperty(process, 'stdin', { value: stdin, configurable: true });
  let written = '';
  jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    written += String(chunk);
    return true;
  });
  const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  return { stdin, output: () => written, exit };
}

export function restoreTerminal() {
  Object.defineProperty(process, 'stdin', originalStdin);
  jest.restoreAllMocks();
}

/** Lets a prompt loop that awaits between attempts ask again. */
export const nextTurn = () => new Promise((resolve) => setImmediate(resolve));
