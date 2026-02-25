import { colors } from '../core';
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
 *   trim: false,
 *   validate: (value) => value.length > 0 || 'Name cannot be empty'
 * });
 */
export async function promptText(message: string, options?: PromptTextOptions): Promise<string> {
  while (true) {
    const value = await internalPrompt(message);

    const finalValue = (options?.trim ?? true) ? value.trim() : value;

    const transformed = options?.transform ? options.transform(finalValue) : finalValue;

    if (!options?.validate) {
      return transformed;
    }

    const result = options.validate(transformed);

    if (result === true) {
      return transformed;
    }

    process.stdout.write(
      `\n${colors.redText('❌')} ${typeof result === 'string' ? colors.redText(result) : colors.redText('Invalid input.')}\n\n`,
    );
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
