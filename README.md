# @syldel/micro-clack

Minimal interactive CLI prompts library, zero dependencies.  
Provides text input, confirm prompts, select menus with scroll, and spinner with colors.

## 🚀 Features

- Text input (`promptText`), maskable for secrets  
- Yes/No confirm (`promptConfirm`)  
- Select menu with scroll (`promptSelect`)  
- Spinner with ANSI colors (`Spinner`)  
- Pure TypeScript, zero dependencies  
- Works on Node 18+ and TypeScript 5+  

## ⚠️ Behaviour to know

- Prompts need an interactive terminal: without a TTY on stdin (piped input, CI),
  they reject with an explicit error before writing anything.
- Ctrl+C restores the terminal and exits with code **130** (SIGINT convention),
  never 0: an interrupted script does not look successful.
- `promptText` has no cursor editing: arrow, Home or Delete keys are ignored
  rather than inserted into the value. Backspace (DEL or Ctrl+H) works.
- `promptSelect` rejects an empty option list.

## 🛠 Usage

```ts
import { promptText, promptConfirm, promptSelect, Spinner } from '@syldel/micro-clack';

(async () => {
  // Text
  const name = await promptText('Enter your name', {
    validate: (value) => value.length > 0 || 'Name cannot be empty'
  });

  // Secret: `mask: true` echoes `*`, `mask: ''` echoes nothing
  const token = await promptText('Enter your token', { mask: true });

  // Confirm
  const proceed = await promptConfirm('Do you want to continue?');
  if (!proceed) process.exit();

  // Select
  const fruits = await promptSelect<{ id: number; code: string }>('Select a fruit', [
    { label: 'Apple', value: { id: 1, code: 'APL' } },
    { label: 'Banana', value: { id: 2, code: 'BNA' } },
    { label: 'Cherry', value: { id: 3, code: 'CHR' } },
  ]);

  // Spinner
  const spinner = new Spinner();
  spinner.start('Processing');
  await new Promise(r => setTimeout(r, 2000));
  spinner.stop('Done!');

  // Colors
  console.log(colors.redText('❌ Error: Something went wrong!'));
  console.log(colors.color('Hello World', colors.code.blue));
})();
```

## 👨‍💻 Développement

### Installation des dépendances

```bash
npm install
```

### Compilation

Génère le dossier `dist/` contenant les fichiers JavaScript et les déclarations de types (`.d.ts`).

```bash
npm run build
```

### Qualité du code

Le projet utilise **ESLint** pour la logique et **Prettier** pour le formatage.

```bash
npx eslint .
```

## 🔗 Utilisation en local (Development Workflow)

Pour utiliser ce package dans tes autres projets sans le publier sur NPM :

1.  Dans le dossier `micro-clack` :
    ```bash
    npm link
    ```

2.  Dans ton projet (ex: `my-nest-project`) :
    ```bash
    npm link @syldel/micro-clack
    ```

## 📦 Publication

La publication passe par **GitHub Actions, sans aucun jeton npm** : le workflow
[`publish.yml`](.github/workflows/publish.yml) s'authentifie auprès de npm par OIDC
(« trusted publishing ») et **dépose** la version sans la rendre publique
(`npm stage publish`). Elle ne devient installable qu'après **approbation avec la 2FA**
du mainteneur. Un workflow, une action ou une dépendance compromis ne peut donc, au
pire, que déposer une version qu'on refusera. Le paquet porte en plus une attestation
de provenance qui le relie au commit et au workflow qui l'ont construit.

Jusqu'au 2026-11-03, la publication se faisait depuis le poste avec un jeton « Bypass
2FA » rangé dans un `.npmrc` : n'importe quel paquet malveillant installé sur la
machine pouvait le lire et publier à notre place. npm retire d'ailleurs la publication
directe par jeton en janvier 2027.

### Publier une nouvelle version

```bash
npm version patch   # ou minor, major : met à jour package.json et crée le tag v<version>
git push origin main --follow-tags
```

Le tag `v*` déclenche le workflow : il vérifie que le tag correspond à `package.json`,
relance lint, tests, build et le contrôle du contenu du paquet, puis dépose la version.
Il reste à l'approuver :

- sur [npmjs.com](https://www.npmjs.com), onglet **Staged Packages**, bouton **Approve** ;
- ou en ligne de commande : `npm stage list @syldel/micro-clack`, puis
  `npm stage approve <stage-id>` (demande la 2FA).

Une version déposée par erreur se refuse avec `npm stage reject <stage-id>`.

### Réglages côté npm (une fois)

Dans les réglages du paquet sur npmjs.com :

- **Trusted Publisher** : GitHub Actions, utilisateur `Syldel`, dépôt `micro-clack`, workflow
  `publish.yml`, actions autorisées **`npm stage publish` seulement**. ⚠️ Une
  déclaration neuve expire si aucune publication ne la valide sous **2 jours**.
- **Publishing access** : « Require two-factor authentication and disallow tokens ».

⚠️ Renommer `publish.yml` ou le dépôt casse la publication (ENEEDAUTH) : la déclaration
sur npmjs.com les nomme exactement. Le champ `repository.url` de `package.json` doit
aussi correspondre au dépôt GitHub.
