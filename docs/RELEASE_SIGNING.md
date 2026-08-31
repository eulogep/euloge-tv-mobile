# MJTV Mobile — audit de signature et publication

## État constaté

Le projet utilise le workflow Expo managé. Aucun dossier natif `android/` ou
`ios/`, profil EAS, certificat iOS, provisioning profile, keystore Android ou
secret de signature n’est suivi dans Git.

Identifiants actuellement configurés :

- Android package : `com.app.eulogetvmobile`
- iOS bundle identifier : `com.app.eulogetvmobile`
- Expo slug : `euloge-tv-mobile`
- schéma de deep link historique : `manuseulogetvmobile`

L’absence de matériel de signature dans le dépôt est correcte. Elle signifie
cependant que cet audit ne peut confirmer ni une signature release Android, ni
une signature/distribution iOS.

## Décision humaine obligatoire avant publication

Le propriétaire de la release doit confirmer si ces identifiants ont déjà été
utilisés dans Google Play, App Store Connect, un build signé ou une configuration
OAuth externe.

- S’ils sont déjà distribués, les conserver pour maintenir les mises à jour,
  callbacks OAuth et liens profonds.
- S’ils n’ont jamais été distribués, choisir des identifiants définitifs sous
  le contrôle de MJTV, puis migrer ensemble le bundle ID, le package Android, le
  schéma de lien profond et les callbacks OAuth.

Cette PR conserve les valeurs existantes : les remplacer sans cette preuve
serait un changement potentiellement cassant.

## Procédure recommandée

1. Configurer le projet EAS sous le compte de publication MJTV.
2. Conserver certificats, keystores et mots de passe dans le gestionnaire de
   secrets EAS ou le coffre-fort approuvé, jamais dans Git.
3. Produire un build interne signé pour chaque plateforme.
4. Valider OAuth, liens profonds, HLS, fallback, PiP et lecture en arrière-plan
   sur appareils physiques.
5. Archiver les informations de rotation/récupération des clés hors du dépôt.

## Limites de cet audit

Les exports Expo JavaScript valident la configuration et le bundling, mais ne
remplacent pas Xcode/App Store Connect, Gradle/Google Play ou un build EAS signé.
