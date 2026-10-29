// Only one prompt listens at a time. The listener must be removed, not just
// paused: a leftover listener wakes up with the next prompt and echoes its keys
// (a secret typed after two text prompts was printed three times), and its
// closure keeps the previous input alive for the life of the process.
let activeCallback: ((key: string) => void) | null = null;

export function listenKeys(callback: (key: string) => void) {
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

function detach() {
  if (activeCallback) {
    process.stdin.removeListener('data', activeCallback);
    activeCallback = null;
  }
}
