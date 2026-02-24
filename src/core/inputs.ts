export function listenKeys(callback: (key: string) => void) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', callback);
}

export function stopListening() {
  process.stdin.setRawMode(false);
  process.stdin.pause();
}
