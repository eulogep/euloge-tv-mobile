# Analyse de référence — MJTV Desktop

## Observation initiale

La référence active utilise un fond presque noir à nuance bleutée, traversé de halos violets et cyan très discrets. Le header comporte un logo MJTV compact à gauche et un contrôle de recherche iconique à droite. La navigation est persistante et emploie cinq destinations : Accueil, Explorer, Live, Ma liste et Profil. Les zones d’action sont espacées et lisibles ; les accents violets identifient l’état actif.

| Élément | Référence desktop observée | Transposition mobile retenue |
| --- | --- | --- |
| Header | Logo MJTV à gauche, recherche à droite | Même hiérarchie dans une zone sûre haute de 52 à 56 points |
| Fond | Noir bleuté avec halos colorés subtils | Même fond, limité à des gradients légers pour préserver la lisibilité mobile |
| Contenu | Rails horizontaux « Pour vous » et « Actualités » | Rails horizontaux avec cartes compactes et défilement tactile |
| Navigation | Cinq destinations nommées avec pictogrammes | Barre inférieure de cinq onglets, réservant l’espace au mini-player |
| Chargement | Cartes skeleton sur surfaces bleu-violet | Skeletons à faible contraste, cohérents avec les surfaces MJTV |

## Limite constatée

Le catalogue de la référence n’a pas terminé son chargement lors de l’observation initiale. Les détails de contenu, ainsi que les états de lecture, seront donc complétés par l’analyse directe des composants et modèles du dépôt cloné plutôt que remplacés par des hypothèses.

## Observation d’interaction

La barre de navigation garde les cinq destinations disponibles au cours du chargement ; l’onglet activé change de couleur tout en conservant la même géométrie. L’absence de données rend toutefois la vue de destination indistincte dans la session de référence. L’implémentation mobile préservera le changement d’état instantané de la navigation et proposera des contenus cohérents à partir des mêmes modèles de chaîne, avec des états de chargement et vide explicites.

## Matrice de parité

| Écran | Référence desktop | Adaptation mobile | Statut |
| --- | --- | --- | --- |
| Accueil | Hero cinématique puis sections éditoriales de chaînes | Hero 16:9 compact, rail tactile, actions lecture et favori accessibles au pouce | À construire |
| Explorer | Découverte par catégories, pays, langues et filtres | Recherche persistante, chips défilables et résultats pleine largeur | À construire |
| Direct | Compteur de chaînes et cartes avec santé | Nombre de chaînes, filtres de statut et cartes denses avec badges explicites | À construire |
| Ma liste | Deux espaces séparés, Favoris et Historique | Segmented control, contenu propre à chaque espace et reprise de lecture | À construire |
| Profil | Paramètres et informations produit | Liste de réglages mobile avec zones tactiles larges | À construire |
| Recherche | Vue immersive, historique et résultats | Feuille ou écran dédié avec retour, champ autofocus et suggestions | À construire |
| Player et guide | Vidéo, commandes, EPG et sources de repli | Vue immersive, contrôles principaux, EPG courant/suivant et mini-player au-dessus des onglets | À construire |

## Décisions de mise en œuvre

La première livraison mobile utilisera des modèles locaux typés pour garder la démonstration disponible hors connexion. La sélection, les favoris et l’historique seront conservés dans l’état local du mobile. Le point d’intégration API et le moteur de lecture seront isolés afin que les règles de catalogue, de disponibilité et de sélection de source de la référence desktop puissent être branchées sans redessiner l’interface.
