# language: fr
Fonctionnalité: Bouton tout déselectionner (US-5.7)
  En tant qu'administrateur, je peux vider la sélection en un clic
  après une affectation d'étiquettes, sans décocher manuellement chaque carte.
  Complète US-5.4 (étiquettes) et US-5.5 (sélection Shift).

  Contexte:
    Étant donné je suis sur la page d'accueil

  # CA1 - Visibilité du bouton
  Scénario: CA1 - Sans sélection le bouton Tout déselectionner n'est pas visible
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Alors le bouton "Tout déselectionner" n'est pas visible

  Scénario: CA1 - Avec au moins un souvenir coché le bouton Tout déselectionner est visible dans la zone étiquettes
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Quand je coche la case à cocher d'une carte de la galerie
    Alors le bouton "Tout déselectionner" est visible
    Et le bouton "Tout déselectionner" est dans la zone étiquettes à côté du bouton "Ajouter étiquette"

  # CA2 - Comportement au clic
  Scénario: CA2 - Clic sur Tout déselectionner décoche toutes les cartes sélectionnées
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins deux souvenirs
    Et je coche la case à cocher de deux cartes de la galerie
    Quand je clique sur le bouton "Tout déselectionner"
    Alors toutes les cartes de la galerie sont décochées
    Et le bouton "Ajouter étiquette" n'est pas visible
    Et le bouton "Tout déselectionner" n'est pas visible

  Scénario: CA2 - Après Tout déselectionner la zone étiquettes disparaît
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Et je coche la case à cocher d'une carte de la galerie
    Quand je clique sur le bouton "Tout déselectionner"
    Alors la zone étiquettes est masquée ou le bouton "Ajouter étiquette" n'est pas visible

  # CA3 - Réservé à l'administrateur
  Scénario: CA3 - L'utilisateur non administrateur ne voit pas le bouton Tout déselectionner
    Étant donné je suis connecté en tant qu'utilisateur non administrateur
    Et la galerie affiche au moins un souvenir
    Alors le bouton "Tout déselectionner" n'est pas visible
    Et les cartes de la galerie n'affichent pas de case à cocher pour sélectionner des souvenirs
