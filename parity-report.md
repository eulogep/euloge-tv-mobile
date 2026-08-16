# Bilan de parité — MJTV Mobile

## Statut

> **MOBILE_DESKTOP_PARITY_FINDINGS_PENDING**

L’interface mobile MJTV est opérationnelle comme adaptation visuelle et tactile de la référence desktop. Les écrans principaux, la navigation, la recherche, les collections, le Player, le MiniPlayer et les états de cartes ont été transposés dans une application Expo orientée portrait. La parité ne peut pas être déclarée entièrement verte tant que le catalogue, l’EPG et les règles de sélection/fallback de sources de l’application desktop ne sont pas fournis par une API mobile commune.

## Écrans comparés et adaptations réalisées

| Écran | Référence desktop | Adaptation mobile livrée | État |
| --- | --- | --- | --- |
| Accueil | Hero cinématique et rails éditoriaux | Hero compact 16:9, cartes horizontales, action lecture et favoris | Implémenté |
| Explorer | Découverte, recherche et filtres | Champ de recherche accessible, écran de recherche immersif, chips de catégories | Implémenté |
| Live | Compteur, santé des chaînes et cartes | Compteur singulier/pluriel, badges Live/Dégradé/Hors ligne, liste tactile | Implémenté |
| Ma liste | Favoris et Historique distincts | Contrôle segmenté, données séparées et persistées localement | Implémenté |
| Profil | Préférences et informations produit | Rangées de réglages adaptées à la zone du pouce | Implémenté |
| Player | Lecture, EPG, minimisation et actions | Player Expo Video, plein écran/PiP, EPG courant/suivant et mini-player persistant | Implémenté |

La direction visuelle reprend les surfaces noir bleuté, les bordures violet transparent, les accents violet/cyan, les badges Live et la typographie dense de la référence. La barre inférieure comporte les cinq destinations desktop : Accueil, Explorer, Live, Ma liste et Profil. Chaque action principale possède une zone tactile d’au moins 44 points et les safe areas sont prises en charge par les conteneurs Expo.

## Écarts restant à lever

| Domaine | Constat | Action nécessaire pour la parité complète |
| --- | --- | --- |
| Catalogue | La livraison utilise un catalogue local typé pour permettre l’aperçu hors connexion. | Exposer et consommer le contrat `/api/catalog` et les fiches de chaîne du backend MJTV existant. |
| Source health | Les badges reposent sur les états de démonstration locaux. | Connecter `canOpenChannel`, la santé de sources et les règles d’éligibilité du desktop. |
| Lecture | Le Player conserve une unique instance `VideoPlayer` à travers la minimisation, avec HLS, plein écran et PiP. | Porter la stratégie de repli de sources, les erreurs détaillées et les sélections de qualité du moteur desktop. |
| EPG | Les blocs Maintenant / À suivre sont intégrés à la carte et au Player. | Brancher les données EPG réelles, le stale state et le guide complet. |
| Validation navigateurs | Les rendus Expo Web ont été inspectés aux quatre largeurs mobile. | Exécuter le jeu Playwright du dépôt desktop sur Chromium et WebKit lorsque l’API mobile commune sera disponible. |

## Validation effectuée

| Contrôle | Résultat |
| --- | --- |
| Formats mobile | Captures réalisées pour Accueil, Explorer, Live, Ma liste et Profil aux largeurs 320, 375, 390 et 430 points. Aucun débordement horizontal observé. |
| Lint | `pnpm lint` réussi. Un avertissement d’environnement Node sur le type de module du fichier ESLint subsiste, sans erreur de lint. |
| TypeScript | `pnpm check` réussi. |
| Tests | `pnpm test` réussi : 4 tests MJTV validés, 1 test d’authentification préexistant ignoré. |
| Build | `pnpm build` réussi. |
| Diff | `git diff --check` réussi. |
| Chromium | Captures de rendu Expo Web réalisées ; aucun scénario d’E2E Chromium séparé n’a été exécuté. |
| WebKit | Non exécuté dans cette livraison mobile Expo. |
| CodeRabbit | Non exécuté. |
| GitGuardian | Non exécuté. |

## Fichiers principaux

| Zone | Fichiers |
| --- | --- |
| Écrans | `app/(tabs)/index.tsx`, `explore.tsx`, `live.tsx`, `my-list.tsx`, `profile.tsx` |
| Navigation et overlays | `app/(tabs)/_layout.tsx`, `app/_layout.tsx`, `components/mjtv/search-overlay.tsx` |
| Player | `components/mjtv/player-portal.tsx` |
| État et données | `lib/mjtv-context.tsx`, `lib/mjtv-data.ts`, `lib/mjtv-state.ts`, `lib/haptics.ts` |
| Identité | `theme.config.js`, `app.config.ts`, `assets/images/*` |
| Documentation et tests | `design.md`, `reference-analysis.md`, `tests/mjtv-data.test.ts` |

## Traçabilité Git

| Élément | Valeur |
| --- | --- |
| Dépôt de référence analysé | `eulogep/Euloge-tv` |
| Base SHA | `a07238bdb93b74bfe754c1310a7691cd6cfb0b2e` |
| Head SHA | Créé au checkpoint de livraison |
| Pull request | Non créée |
| Merge automatique | Non effectué |

La prochaine étape recommandée est de brancher l’application mobile sur les mêmes endpoints et règles métier que le desktop, puis de rejouer la matrice de validation du Player et de l’EPG sur appareils iOS et Android réels.
