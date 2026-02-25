import { listenKeys, stopListening } from '../core/inputs';
import { clear, log } from '../core/render';
import { colors } from '../core/colors';

/**
 * Interactive selection prompt with typed values.
 *
 * The user navigates the options with Up/Down arrows,
 * and presses Enter to select. Ctrl+C exits.
 *
 * @template T - Type of the option values.
 *
 * @param message - The prompt message displayed above the options.
 * @param options - Array of options with `label` (displayed) and `value` (returned).
 * @param pageSize - Optional number of options displayed at a time (default: 5).
 *
 * @returns Promise resolving to the selected option's value of type T.
 *
 * @example
 * const color = await promptSelect('Pick a color', [
 *   { label: 'Red', value: '#ff0000' },
 *   { label: 'Green', value: '#00ff00' },
 *   { label: 'Blue', value: '#0000ff' }
 * ]);
 */
export async function promptSelect<T>(
  message: string,
  options: { label: string; value: T }[],
  pageSize = 5,
): Promise<T> {
  let selected = 0;
  let offset = 0;

  function render() {
    clear();
    log(colors.brightText(message));

    const visible = options.slice(offset, offset + pageSize);
    visible.forEach((opt, i) => {
      const index = i + offset;
      if (index === selected) log(colors.cyanText('> ' + opt.label));
      else log('  ' + opt.label);
    });

    if (options.length > pageSize) {
      log(
        `\nShowing ${offset + 1}-${Math.min(offset + pageSize, options.length)} of ${options.length}`,
      );
    }
  }

  render();

  return new Promise<T>((resolve) => {
    listenKeys((key) => {
      if (key === '\u0003') process.exit(); // Ctrl+C
      if (key === '\u001B[A') selected = (selected - 1 + options.length) % options.length; // Up
      if (key === '\u001B[B') selected = (selected + 1) % options.length; // Down

      if (selected < offset) offset = selected;
      if (selected >= offset + pageSize) offset = selected - pageSize + 1;

      if (key === '\r') {
        stopListening();
        resolve(options[selected].value);
      }

      render();
    });
  });
}
