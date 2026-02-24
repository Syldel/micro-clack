import { listenKeys, stopListening } from '../inputs';
import { clear, log } from '../render';
import { colors } from '../colors';

export async function promptSelect(
  message: string,
  options: string[],
  pageSize = 5,
): Promise<string> {
  let selected = 0;
  let offset = 0;

  function render() {
    clear();
    log(colors.bright + message + colors.reset);
    const visible = options.slice(offset, offset + pageSize);
    visible.forEach((opt, i) => {
      const index = i + offset;
      if (index === selected) log(colors.cyan + '> ' + opt + colors.reset);
      else log('  ' + opt);
    });
    if (options.length > pageSize) {
      log(
        `\nShowing ${offset + 1}-${Math.min(offset + pageSize, options.length)} of ${options.length}`,
      );
    }
  }

  render();

  return new Promise((resolve) => {
    listenKeys((key) => {
      if (key === '\u0003') process.exit(); // Ctrl+C
      if (key === '\u001B[A') selected = (selected - 1 + options.length) % options.length; // Up
      if (key === '\u001B[B') selected = (selected + 1) % options.length; // Down

      if (selected < offset) offset = selected;
      if (selected >= offset + pageSize) offset = selected - pageSize + 1;

      if (key === '\r') {
        stopListening();
        resolve(options[selected]);
      }
      render();
    });
  });
}
