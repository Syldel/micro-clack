import { listenKeys, stopListening } from '../core/inputs';

/**
 * Displays a yes/no confirmation prompt in the terminal.
 *
 * The user can confirm by pressing 'y' / 'n' or Enter for default.
 * Ctrl+C exits the process.
 *
 * @param message - The message asking for confirmation.
 * @param defaultValue - Optional default choice if the user just presses Enter:
 *   - `true` for Yes
 *   - `false` for No
 *   Default is `false`.
 *
 * @returns A Promise resolving to `true` if the user confirmed, `false` otherwise.
 *
 * @example
 * const proceed = await promptConfirm('Are you sure?');
 * if (!proceed) process.exit();
 */
export function promptConfirm(message: string, defaultValue: boolean = false): Promise<boolean> {
  return new Promise((resolve) => {
    const promptText = `${message} (y/n)${defaultValue ? ' [Y]' : ' [N]'}: `;

    const showPrompt = () => process.stdout.write(promptText);

    const handleKey = (key: string) => {
      const lower = key.toLowerCase();
      if (lower === 'y') {
        stopListening();
        process.stdout.write('y\n');
        resolve(true);
      } else if (lower === 'n') {
        stopListening();
        process.stdout.write('n\n');
        resolve(false);
      } else if (key === '\r') {
        stopListening();
        process.stdout.write((defaultValue ? 'y' : 'n') + '\n');
        resolve(defaultValue);
      } else if (key === '\u0003') {
        // Ctrl+C
        stopListening();
        process.exit();
      } else {
        // invalid key, re-show prompt
        process.stdout.write('\n');
        showPrompt();
      }
    };

    showPrompt();
    listenKeys(handleKey);
  });
}
