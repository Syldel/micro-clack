import { assertInteractive, exitOnInterrupt, listenKeys, stopListening } from '../core/inputs';
import { clear, log } from '../core/render';
import { colors } from '../core/colors';

// A terminal sends an arrow in one of two forms: CSI (`ESC [ A`) in normal
// cursor mode, SS3 (`ESC O A`) in application cursor mode. Only CSI was read
// up to 1.0.3, so in a terminal left in application mode the arrows did
// nothing, silently (measured on Windows on 2026-11-05: "\u001bOA", "\u001bOB").
const UP_KEYS = new Set(['\u001B[A', '\u001BOA']);
const DOWN_KEYS = new Set(['\u001B[B', '\u001BOB']);

// Digits move the selection without any escape sequence, so no terminal can
// leave the menu stuck. They only move it: Enter still confirms.
const MAX_NUMBERED = 9;

/**
 * Interactive selection prompt with typed values.
 *
 * The user moves with the Up/Down arrows or types the number shown before an
 * option (the first nine are numbered), then presses Enter to select.
 * Ctrl+C exits.
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
  // Both checks run before render() clears the screen.
  if (options.length === 0) {
    throw new Error('micro-clack: promptSelect needs at least one option.');
  }
  assertInteractive();

  let selected = 0;
  let offset = 0;
  const numbered = Math.min(options.length, MAX_NUMBERED);
  const hint = `Up/Down or 1-${numbered}, then Enter`;

  function render() {
    clear();
    log(colors.brightText(message));

    const visible = options.slice(offset, offset + pageSize);
    visible.forEach((opt, i) => {
      const index = i + offset;
      const number = index < numbered ? `${index + 1}. ` : '   ';
      if (index === selected) log(colors.cyanText('> ' + number + opt.label));
      else log('  ' + number + opt.label);
    });

    if (options.length > pageSize) {
      log(
        `\nShowing ${offset + 1}-${Math.min(offset + pageSize, options.length)} of ${options.length}`,
      );
    }
    log(colors.dimText(hint));
  }

  render();

  return new Promise<T>((resolve) => {
    listenKeys((key) => {
      if (key === '\u0003') exitOnInterrupt();
      if (UP_KEYS.has(key)) selected = (selected - 1 + options.length) % options.length;
      if (DOWN_KEYS.has(key)) selected = (selected + 1) % options.length;
      if (/^[1-9]$/.test(key) && Number(key) <= numbered) selected = Number(key) - 1;

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
