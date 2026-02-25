import { listenKeys, stopListening } from '../core/inputs';

/**
 * Options for the promptText function.
 */
export interface PromptTextOptions {
  validate?: (value: string) => boolean | string;
  transform?: (value: string) => string;
  trim?: boolean;
}

/**
 * Displays an interactive text prompt in the terminal.
 * @example
 * const name = await promptText('Enter your name', {
 *   trim: true,
 *   validate: (value) => value.length > 0 || 'Name cannot be empty'
 * });
 */
export async function promptText(message: string, options?: PromptTextOptions): Promise<string> {
  while (true) {
    const value = await internalPrompt(message);

    let finalValue = options?.trim ? value.trim() : value;

    if (options?.transform) {
      finalValue = options.transform(finalValue);
    }

    if (!options?.validate) {
      return finalValue;
    }

    const result = options.validate(finalValue);

    if (result === true) {
      return finalValue;
    }

    process.stdout.write(`\n❌ ${typeof result === 'string' ? result : 'Invalid input.'}\n\n`);
  }
}

function internalPrompt(message: string): Promise<string> {
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
