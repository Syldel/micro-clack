import { promptText, promptConfirm, promptSelect, Spinner } from '../src';

(async () => {
  const NAME_REGEX = /^[a-zA-Z _-]{3,20}$/;
  const name = await promptText('Enter your name', {
    trim: true,
    validate: (value) =>
      NAME_REGEX.test(value) ||
      'Name must be 3-20 characters long and contain only letters, " ", "_" or "-".',
  });
  console.log('Name:', name);

  const proceed = await promptConfirm('Do you want to continue?');
  if (!proceed) process.exit();

  type Country = { id: number; iso: string };
  const countries: { label: string; value: Country }[] = [
    { label: 'United States', value: { id: 1, iso: 'US' } },
    { label: 'Canada', value: { id: 2, iso: 'CA' } },
    { label: 'Mexico', value: { id: 3, iso: 'MX' } },
    { label: 'Brazil', value: { id: 4, iso: 'BR' } },
    { label: 'United Kingdom', value: { id: 5, iso: 'GB' } },
    { label: 'France', value: { id: 6, iso: 'FR' } },
    { label: 'Germany', value: { id: 7, iso: 'DE' } },
    { label: 'Italy', value: { id: 8, iso: 'IT' } },
    { label: 'Spain', value: { id: 9, iso: 'ES' } },
    { label: 'Japan', value: { id: 10, iso: 'JP' } },
    { label: 'China', value: { id: 11, iso: 'CN' } },
    { label: 'India', value: { id: 12, iso: 'IN' } },
    { label: 'Australia', value: { id: 13, iso: 'AU' } },
    { label: 'New Zealand', value: { id: 14, iso: 'NZ' } },
    { label: 'South Africa', value: { id: 15, iso: 'ZA' } },
  ];
  const selectedCountry = await promptSelect<Country>('Select a country', countries);
  console.log('You selected:', selectedCountry);

  const spinner = new Spinner();
  spinner.start('Processing');
  await new Promise((r) => setTimeout(r, 3000));
  spinner.stop('Done!');
})();
