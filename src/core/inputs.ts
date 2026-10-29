// Only one prompt listens at a time. The listener must be removed, not just
// paused: a leftover listener wakes up with the next prompt and echoes its keys
// (a secret typed after two text prompts was printed three times), and its
// closure keeps the previous input alive for the life of the process.
let activeCallback: ((key: string) => void) | null = null;

/**
 * Throws unless stdin is an interactive terminal. Without one, raw mode does
 * not exist and the prompt used to die on "setRawMode is not a function".
 */
export function assertInteractive() {
  if (!process.stdin.isTTY) {
    throw new Error(
      'micro-clack: this prompt needs an interactive terminal, but stdin is not a TTY (piped input, CI, or a non-interactive shell).',
    );
  }
}

export function listenKeys(callback: (key: string) => void) {
  assertInteractive();
  detach();
  activeCallback = callback;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', callback);
}

export function stopListening() {
  detach();
  process.stdin.setRawMode(false);
  process.stdin.pause();
}

/**
 * Ctrl+C: releases the terminal, then exits with 130, the shell convention for
 * SIGINT. A bare process.exit() reported success for an interrupted script.
 */
export function exitOnInterrupt(): never {
  stopListening();
  process.stdout.write('\n');
  return process.exit(130);
}

function detach() {
  if (activeCallback) {
    process.stdin.removeListener('data', activeCallback);
    activeCallback = null;
  }
}
