#### US-4.1 : Table souvenir et référencement par le script HEIC

**Statut** : validée

**En tant que** administrateur de la base de données

**Je souhaite** que chaque souvenir soit référencé dans une table, et que le script de conversion HEIC effectue ce référencement automatiquement

**Afin de** disposer d’un inventaire fiable des souvenirs et de leur état de traitement (Done, Webp, miniature).

- **Critères d'acceptation** :
- **CA1 - Table souvenir** :
  - Une table `souvenir` existe en base avec les colonnes : `id` (INTEGER, clé primaire auto-incrémentée), `nom` (TEXT, nom du souvenir, ex. IMG_3850), `done` (INTEGER 0/1), `webp` (INTEGER 0/1), `miniature` (INTEGER 0/1).
- **CA2 - Référencement par le script HEIC** :
  - Lorsque le script `convert-heic-to-webp` convertit un fichier HEIC avec succès, il insère ou met à jour l’enregistrement correspondant dans la table `souvenir` avec `nom` = nom de base du fichier (sans extension), `done` = 1, `webp` = 1, `miniature` = 1.
- **CA3 - Cohérence des dossiers** :
  - Le script HEIC ne modifie la base que pour les conversions réussies (fichier créé dans `data/souvenirs/webp`, `data/souvenirs/miniature`, et déplacé vers `data/input/done`).
- **CA4 - Script de synchronisation optionnel** :
  - Un script `db:souvenirs-sync` (ou équivalent) permet de resynchroniser la table avec l’état réel des dossiers Done, webp et miniature, afin de corriger des écarts (fichiers ajoutés manuellement, fichiers supprimés, etc.).
