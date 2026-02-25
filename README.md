# @syldel/micro-clack

Minimal interactive CLI prompts library, zero dependencies.  
Provides text input, confirm prompts, select menus with scroll, and spinner with colors.

## 🚀 Features

- Text input (`promptText`)  
- Yes/No confirm (`promptConfirm`)  
- Select menu with scroll (`promptSelect`)  
- Spinner with ANSI colors (`Spinner`)  
- Pure TypeScript, zero dependencies  
- Works on Node 18+ and TypeScript 5+  

## 🛠 Usage

```ts
import { promptText, promptConfirm, promptSelect, Spinner } from '@syldel/micro-clack';

(async () => {
  const name = await promptText('Enter your name', {
    trim: true,
    validate: (value) => value.length > 0 || 'Name cannot be empty'
  });

  const proceed = await promptConfirm('Do you want to continue?');
  if (!proceed) process.exit();

  const color = await promptSelect('Pick a color', ['Red','Green','Blue','Yellow','Magenta','Cyan','Black'], 4);
  console.log('You selected:', color, 'Name:', name);

  const spinner = new Spinner();
  spinner.start('Processing');
  await new Promise(r => setTimeout(r, 2000));
  spinner.stop('Done!');
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

Le projet utilise des **Granular Access Tokens** pour la publication afin de contourner la double authentification (2FA) manuelle tout en maintenant une sécurité maximale.

### Configuration du Token

1. Générer un token sur NPM avec les permissions `Read and Write`.
2. Restreindre l'accès au package `@syldel/micro-clack` uniquement.
3. Utiliser l'option `Bypass 2FA` pour permettre l'automatisation.

### Commande de publication rapide

Si tu n'utilises pas de fichier `.npmrc`, tu peux publier en passant le token directement :

```bash
npm publish --access public --//registry.npmjs.org/:_authToken=TON_TOKEN_ICI
```

### Configuration de la publication

Créez un fichier .npmrc à la racine (ignoré par Git) pour l'authentification :

```
//registry.npmjs.org/:_authToken=npm_votre_token_ici
```

### Publier une nouvelle version

La commande suivante automatise le build, l'incrémentation de version et l'envoi vers NPM :

```bash
npm run release
```

### Pousse le commit ET le tag sur GitHub

```bash
git push origin main --follow-tags
```
