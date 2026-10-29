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
    expect(output.endsWith('\bDone\n')).toBe(true);
  });
});
