import { FakeTerminal, installFakeTerminal, restoreTerminal } from '../testing/fake-terminal';
import { promptConfirm } from '../prompts/confirm';
import { promptSelect } from '../prompts/select';
import { promptText } from '../prompts/text';

let term: FakeTerminal;

beforeEach(() => {
  term = installFakeTerminal();
});

afterEach(() => {
  restoreTerminal();
});

const prompts = {
  promptText: () => promptText('Name'),
  promptConfirm: () => promptConfirm('Sure?'),
  promptSelect: () => promptSelect('Pick', [{ label: 'A', value: 'a' }]),
};

describe.each(Object.entries(prompts))('%s', (_name, prompt) => {
  // A bare process.exit() reports success: a script interrupted mid-entry
  // looked like it had completed. 130 is the shell convention for SIGINT.
  it('exits with code 130 on Ctrl+C, after releasing the terminal', () => {
    void prompt();
    term.stdin.type('\u0003');

    expect(term.exit).toHaveBeenCalledWith(130);
    expect(term.stdin.setRawMode).toHaveBeenLastCalledWith(false);
    expect(term.stdin.listenerCount('data')).toBe(0);
  });

  // Without a terminal, setRawMode does not exist: the prompt used to die on
  // "setRawMode is not a function", which says nothing of the actual cause.
  it('refuses to run without a terminal, and says so', async () => {
    term.stdin.isTTY = undefined;

    await expect(prompt()).rejects.toThrow(/needs an interactive terminal/);
    // Nothing drawn: select would otherwise have cleared the screen first.
    expect(term.output()).toBe('');
  });
});
