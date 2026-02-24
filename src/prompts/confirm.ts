import { listenKeys, stopListening } from '../core/inputs';

export function promptConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    process.stdout.write(message + ' (y/n): ');
    listenKeys((key) => {
      if (key.toLowerCase() === 'y') {
        stopListening();
        process.stdout.write('y\n');
        resolve(true);
      } else if (key.toLowerCase() === 'n') {
        stopListening();
        process.stdout.write('n\n');
        resolve(false);
      } else if (key === '\u0003') {
        // Ctrl+C
        stopListening();
        process.exit();
      }
    });
  });
}
