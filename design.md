# Plan d’interface — MJTV Mobile

## Intention

MJTV Mobile transpose l’identité cinématique de MJTV à un écran téléphone en orientation portrait 9:16. L’expérience conserve la profondeur noire, les lueurs violet-cyan, les surfaces translucides et la hiérarchie éditoriale de la référence desktop. Les actions fréquentes restent atteignables d’une seule main grâce à une navigation inférieure permanente, des zones tactiles d’au moins 44 × 44 points et des feuilles contextuelles plutôt que des panneaux latéraux.

## Écrans

| Écran | Contenu principal | Fonctions attendues |
| --- | --- | --- |
| Accueil | En-tête MJTV, recherche, hero éditorial, sections de chaînes, catégories et reprise de lecture | Ouvrir le player, accéder aux listes, mettre une chaîne en favori |
| Explorer | Champ de recherche, filtres sous forme de chips, liste de résultats | Rechercher, filtrer par pays, langue, catégorie, disponibilité et état |
| Direct | Nombre de chaînes et liste des flux en direct | Consulter l’état live, ouvrir une chaîne et identifier les indisponibilités |
| Ma liste | Onglets distincts Favoris et Historique | Passer d’une collection à l’autre, relancer ou supprimer localement une entrée |
| Profil | Identité de compte, préférences, paramètres de lecture | Accéder aux réglages et informations de compte sans modifier l’architecture d’authentification existante |
| Player | Vidéo, titre, actions lecture, minimisation, favoris et EPG compact | Lire/mettre en pause, minimiser, fermer, afficher les programmes courant et suivant |
| Recherche | Recherche en surimpression avec suggestions et résultats | Soumettre une requête, revenir à l’écran d’origine, ouvrir un résultat |

## Hiérarchie et disposition

Le haut de chaque vue présente une zone sûre sombre, suivie d’un header compact : monogramme MJTV à gauche, recherche et action de profil à droite. L’Accueil privilégie un hero 16:9 pleine largeur au-dessus de rails horizontaux de cartes. Chaque carte de chaîne affiche un visuel ou monogramme, l’état LIVE, le titre du programme, une barre de progression et une action favori. L’écran Explorer concentre les contrôles sous le champ de recherche sous forme de chips horizontalement défilables ; les résultats sont composés de cellules touchables pleine largeur.

Le player est présenté comme une vue immersive. Lorsqu’il est réduit, un mini-player à hauteur fixe est ancré juste au-dessus de la barre de navigation et ne recrée pas l’instance vidéo. La barre de navigation inférieure compte Accueil, Explorer, Direct, Ma liste et Profil ; sa surface noire semi-opaque avec bordure cyan atténuée appartient au même système visuel que la version desktop.

## Parcours essentiels

| Parcours | Étapes |
| --- | --- |
| Démarrer un direct | Accueil ou Direct → toucher une carte de chaîne → Player → lecture/pause, EPG et plein écran |
| Conserver la lecture | Player → minimiser → mini-player au-dessus de la navigation → toucher le mini-player pour restaurer le Player |
| Explorer le catalogue | Explorer → saisir une requête → régler les chips de filtre → toucher un résultat → Player |
| Gérer sa liste | Ma liste → basculer entre Favoris et Historique → toucher une entrée pour reprendre ou retirer un favori |

## Couleurs et matière

La palette reste volontairement sombre et brillante afin de conserver la signature MJTV. Le fond racine est **#05050B**, les surfaces sont **#111324**, les bordures sont bleu-violet à faible contraste, le violet de marque est **#8B4DFF**, le cyan de marque est **#24C8FF**, et le signal Live est **#FF4F70**. Les titres utilisent un blanc légèrement bleuté **#F5F7FF** et les métadonnées **#A9ADC2**. Les gradients violet → cyan sont réservés au logo, aux actions de lecture et aux éléments premium pour préserver leur impact.

## Principes d’accessibilité et de sûreté d’affichage

Les contenus défilants gardent une marge de sécurité au-dessus de la barre de navigation et du mini-player. Les libellés ne sont pas essentiels uniquement par la couleur : les états live, dégradé et indisponible disposent d’un texte explicite. Les icônes affichent un libellé d’accessibilité, les contrastes restent élevés, et les titres peuvent se replier sur deux lignes plutôt que déborder.
