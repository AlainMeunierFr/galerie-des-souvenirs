# language: fr
Fonctionnalité: Étiquettes sur les souvenirs (US-5.4)
  En mode administrateur, l'admin peut sélectionner des souvenirs (cases à cocher)
  et leur affecter des étiquettes (création ou sélection dans la liste).

  Contexte:
    Étant donné je suis sur la page d'accueil

  # CA1 - Cases à cocher visibles uniquement pour l'admin
  Scénario: CA1 - L'administrateur voit une case à cocher sur chaque carte souvenir
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Alors chaque carte de la galerie affiche une case à cocher dans le coin supérieur gauche sur l'image
    Et la zone des étiquettes n'est pas visible ou n'affiche pas le bouton "Ajouter étiquette"

  Scénario: CA1 - L'utilisateur non administrateur ne voit pas de case à cocher sur les cartes
    Étant donné je suis connecté en tant qu'utilisateur non administrateur
    Et la galerie affiche au moins un souvenir
    Alors les cartes de la galerie n'affichent pas de case à cocher pour sélectionner des souvenirs

  # CA2 - Zone étiquettes (bouton + liste) visible quand au moins un souvenir est coché
  Scénario: CA2 - Sans sélection la zone étiquettes ne propose pas le bouton Ajouter étiquette
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Alors le bouton "Ajouter étiquette" n'est pas visible

  Scénario: CA2 - Avec au moins un souvenir coché le bouton Ajouter étiquette et la liste des étiquettes sont visibles
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Quand je coche la case à cocher d'une carte de la galerie
    Alors le bouton "Ajouter étiquette" est visible
    Et la zone affiche la liste des étiquettes existantes ou un emplacement pour celle-ci

  # CA3 - Création d'étiquette (pop-up, Créer, affectation aux cochés)
  Scénario: CA3 - Clic sur Ajouter étiquette ouvre une pop-up avec champ libellé et boutons Annuler et Créer
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Et je coche la case à cocher d'une carte de la galerie
    Quand je clique sur le bouton "Ajouter étiquette"
    Alors une pop-up ou un dialogue modal s'affiche
    Et la pop-up contient un champ de saisie pour le libellé
    Et la pop-up contient un bouton "Annuler"
    Et la pop-up contient un bouton "Créer"

  Scénario: CA3 - Création d'une nouvelle étiquette avec libellé non vide l'affecte aux souvenirs cochés
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Et je coche la case à cocher d'une carte de la galerie
    Et l'étiquette "Vacances" n'existe pas encore
    Quand je clique sur le bouton "Ajouter étiquette"
    Et je saisis "Vacances" dans le champ libellé de la pop-up
    Et je clique sur le bouton "Créer" dans la pop-up
    Alors l'étiquette "Vacances" est créée
    Et l'étiquette "Vacances" est affectée au souvenir coché

  Scénario: CA3 - Création avec un libellé déjà existant affiche un message et ne crée pas de doublon
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Et l'étiquette "Famille" existe déjà
    Et je coche la case à cocher d'une carte de la galerie
    Quand je clique sur le bouton "Ajouter étiquette"
    Et je saisis "Famille" dans le champ libellé de la pop-up
    Et je clique sur le bouton "Créer" dans la pop-up
    Alors un message indique que l'étiquette existe déjà ou que la création est refusée
    Et aucune nouvelle étiquette en doublon n'est créée

  # CA4 - Clic sur étiquette existante : affectation, désaffectation ou panachage
  Scénario: CA4 - Clic sur une étiquette qu'aucun souvenir coché n'a l'affecte à tous les cochés
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Et l'étiquette "Noël" existe et n'est affectée à aucun des souvenirs visibles
    Et je coche la case à cocher de deux cartes de la galerie
    Quand je clique sur l'étiquette "Noël" dans la liste des étiquettes
    Alors l'étiquette "Noël" est affectée à tous les souvenirs cochés

  Scénario: CA4 - Clic sur une étiquette que tous les souvenirs cochés ont la désaffecte pour tous
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Et l'étiquette "Portrait" existe et est déjà affectée aux souvenirs que je vais cocher
    Et je coche la case à cocher des cartes qui ont l'étiquette "Portrait"
    Quand je clique sur l'étiquette "Portrait" dans la liste des étiquettes
    Alors l'étiquette "Portrait" est désaffectée pour tous les souvenirs cochés

  Scénario: CA4 - Panachage : une question propose Supprimer sur tout, Affecter à tout ou Annuler
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins deux souvenirs
    Et l'étiquette "Paysage" existe
    Et un des souvenirs a l'étiquette "Paysage" et l'autre non
    Et je coche la case à cocher de ces deux cartes
    Quand je clique sur l'étiquette "Paysage" dans la liste des étiquettes
    Alors une question ou un dialogue propose au moins les choix "Supprimer sur tout", "Affecter à tout" et "Annuler"
