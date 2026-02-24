import { listenKeys, stopListening } from '../core/inputs';

export function promptText(message: string): Promise<string> {
  return new Promise((resolve) => {
    let input = '';
    process.stdout.write(message + ': ');

    listenKeys((key) => {
      if (key === '\r') {
        stopListening();
        process.stdout.write('\n');
        resolve(input);
      } else if (key === '\u0003') {
        // Ctrl+C
        stopListening();
        process.exit();
      } else if (key === '\u007F') {
        // Backspace
        input = input.slice(0, -1);
        process.stdout.write('\b \b');
      } else {
        input += key;
        process.stdout.write(key);
      }
    });
  });
}
