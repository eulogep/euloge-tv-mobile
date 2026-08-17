# MJTV Mobile

Application mobile officielle MJTV, maintenue par Euloge Mabiala dans
[`eulogep/euloge-tv-mobile`](https://github.com/eulogep/euloge-tv-mobile).

## Architecture

- Expo 54, React Native 0.81, React 19 et Expo Router.
- Android, iOS et web à partir du même projet Expo managé.
- `expo-video` pour HLS/MP4, Picture-in-Picture et mini-player persistant.
- React Query + tRPC pour relier l’interface au proxy mobile.
- Le proxy lit exclusivement le contrat public MJTV configuré par
  `MJTV_API_BASE_URL` ; aucune chaîne ou URL de lecture de démonstration ne
  remplace une erreur de production.

Le chemin des données est :

`UI Expo → React Query/tRPC → proxy Express → API publique MJTV`

## Configuration

- `MJTV_API_BASE_URL` : origine de l’API publique MJTV côté serveur. HTTPS est
  obligatoire en production.
- `EXPO_PUBLIC_API_BASE_URL` : origine du proxy mobile consommé par le client.
- Les variables OAuth existantes sont décrites dans `constants/oauth.ts`.

Ne placez jamais de secret, certificat, keystore ou mot de passe de signature
dans le dépôt.

## Commandes

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm check
corepack pnpm test
corepack pnpm build
```

Le smoke test réseau réel est volontairement séparé des tests déterministes :

```powershell
$env:MJTV_API_BASE_URL="https://tv.mjtv.app"
corepack pnpm test:live
```

Une panne amont doit produire un état d’erreur explicite, jamais un catalogue
vide ou des données factices.

## Publication

Le statut de signature et les décisions requises avant une release sont dans
[`docs/RELEASE_SIGNING.md`](docs/RELEASE_SIGNING.md).
