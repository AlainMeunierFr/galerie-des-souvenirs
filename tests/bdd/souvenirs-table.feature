# language: fr
Fonctionnalité: Table souvenir et référencement par le script HEIC (US-4.1)

  Contexte:
    Étant donné la table souvenir est initialisée

  Scénario: CA1 - La table souvenir existe avec les colonnes attendues
    Alors la table souvenir existe
    Et la table souvenir contient les colonnes id, nom, done, webp, miniature

  Scénario: CA2 - Conversion HEIC réussie crée un enregistrement en base
    Étant donné un fichier HEIC "IMG_TEST.HEIC" dans data/input
    Quand je lance le script convert-heic-to-webp
    Alors un souvenir "IMG_TEST" existe en base avec done=1, webp=1, miniature=1

  Scénario: CA4 - Le script db:souvenirs-sync resynchronise la table avec les dossiers
    Étant donné des fichiers webp dans data/souvenirs/webp et data/souvenirs/miniature
    Quand je lance le script db:souvenirs-sync
    Alors la table souvenir contient un enregistrement pour chaque fichier trouvé
    Et chaque enregistrement a done, webp et miniature cohérents avec la présence des fichiers
