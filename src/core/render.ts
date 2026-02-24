export function clear() {
  process.stdout.write('\x1b[2J\x1b[0f');
}

export function moveCursor(x: number, y: number) {
  process.stdout.write(`\x1b[${y};${x}H`);
}

export function log(...args: any[]) {
  process.stdout.write(args.join(' ') + '\n');
}
