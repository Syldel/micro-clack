import { promptText, promptConfirm, promptSelect, Spinner, colors } from '../src';

(async () => {
  const line = Object.keys(colors)
    .filter((key) => key !== 'reset') // on ignore le reset
    .map((key) => `${colors[key as keyof typeof colors]}${key}${colors.reset}`)
    .join(' ');
  console.log('Colors:', line);
  console.log('');

  const name = await promptText('Enter your name');
  console.log('Name:', name);

  const proceed = await promptConfirm('Do you want to continue?');
  if (!proceed) process.exit();

  const color = await promptSelect(
    'Pick a color',
    ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Cyan', 'Black'],
    4,
  );
  console.log('You selected:', color);

  const spinner = new Spinner();
  spinner.start('Processing');
  await new Promise((r) => setTimeout(r, 3000));
  spinner.stop('Done!');
})();
