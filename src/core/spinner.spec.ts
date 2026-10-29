import { Spinner } from './spinner';

let output: string;

beforeEach(() => {
  jest.useFakeTimers();
  output = '';
  jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    output += String(chunk);
    return true;
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('Spinner', () => {
  // A second start() used to overwrite the interval handle: the first interval
  // kept drawing forever and kept the process alive.
  it('keeps a single interval when started twice', () => {
    const spinner = new Spinner();
    spinner.start('One');
    spinner.start('Two');

    expect(jest.getTimerCount()).toBe(1);
    spinner.stop();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('ends the first line before starting the second', () => {
    const spinner = new Spinner();
    spinner.start('One');
    spinner.start('Two');
    spinner.stop();

    expect(output).toMatch(/One.*\n.*Two/s);
  });

  it('writes nothing when stopped without having started', () => {
    new Spinner().stop();

    expect(output).toBe('');
  });

  it('writes the final message once even when stopped twice', () => {
    const spinner = new Spinner();
    spinner.start('Work');
    jest.advanceTimersByTime(250);
    spinner.stop('Done');
    const afterFirstStop = output;
    spinner.stop('Done');

    expect(output).toBe(afterFirstStop);
    expect(screen(output)).toBe('Work Done\n');
  });

  // Seen in a real terminal: the first frame overwrote the separating space,
  // so the final message ended up glued to the label ("ProcessingDone!").
  it('keeps the space between the label and the final message', () => {
    const spinner = new Spinner();
    spinner.start('Processing');
    jest.advanceTimersByTime(350);
    spinner.stop('Done!');

    expect(screen(output)).toBe('Processing Done!\n');
  });

  it('draws its frame after the space while it spins', () => {
    const spinner = new Spinner();
    spinner.start('Processing');
    jest.advanceTimersByTime(150);

    expect(screen(output)).toBe('Processing \\');
    spinner.stop();
  });
});

/**
 * What a terminal shows for this output: ANSI colors dropped, `\b` moves the
 * cursor one column back, and the next character overwrites that column.
 */
function screen(raw: string): string {
  const lines: string[] = [];
  let line: string[] = [];
  let col = 0;
  // eslint-disable-next-line no-control-regex
  for (const ch of raw.replace(/\x1b\[[0-9;]*m/g, '')) {
    if (ch === '\n') {
      lines.push(line.join(''));
      line = [];
      col = 0;
    } else if (ch === '\b') {
      col = Math.max(0, col - 1);
    } else {
      line[col++] = ch;
    }
  }
  return [...lines, line.join('')].join('\n');
}
