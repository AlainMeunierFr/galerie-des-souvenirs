# language: fr
Fonctionnalité: Sélection rapide par Shift (US-5.5)
  En tant qu'administrateur, je peux sélectionner ou désélectionner une plage de souvenirs
  avec la touche Shift pour aller plus vite (étiquettes).

  Contexte:
    Étant donné je suis sur la page d'accueil

  # CA1 - Sélection par plage (Shift + clic)
  Scénario: CA1 - Shift + clic sélectionne toutes les cartes entre la première et la cible
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins trois souvenirs
    Quand je clique sur la case à cocher de la 1ère carte
    Et je maintiens la touche Shift et je clique sur la case à cocher de la 3e carte
    Alors les cartes de la 1ère à la 3e sont cochées

  # CA2 - Désélection par plage (Shift + clic) — la plage prend l'état de la carte cliquée
  Scénario: CA2 - Shift + clic sur une carte décochée déselectionne la plage
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins quatre souvenirs
    Et j'ai coché les cartes de la 1ère à la 4e
    Quand je clique sur la case à cocher de la 4e carte
    Et je maintiens la touche Shift et je clique sur la case à cocher de la 2e carte
    Alors les cartes de la 2e à la 4e sont décochées
    Et la 1ère carte reste cochée

  Scénario: CA2 - Shift + clic sur une carte cochée sélectionne la plage
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins trois souvenirs
    Et seule la 1ère carte est cochée
    Quand je maintiens la touche Shift et je clique sur la case à cocher de la 3e carte
    Alors les cartes de la 1ère à la 3e sont cochées

  # CA3 - Ancrage
  Scénario: CA3 - Le dernier clic sans Shift définit l'ancrage pour le Shift + clic suivant
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins quatre souvenirs
    Quand je clique sur la case à cocher de la 1ère carte
    Et je clique sur la case à cocher de la 3e carte
    Et je maintiens la touche Shift et je clique sur la case à cocher de la 4e carte
    Alors les cartes de la 3e à la 4e sont cochées
    Et la 1ère carte est décochée

  # CA4 - Pas d'impact hors admin
  Scénario: CA4 - Le comportement Shift ne s'applique qu'en mode administrateur
    Étant donné je suis connecté en tant qu'utilisateur non administrateur
    Et la galerie affiche au moins un souvenir
    Alors les cartes de la galerie n'affichent pas de case à cocher pour sélectionner des souvenirs
    Et le comportement Shift n'est pas exposé à l'utilisateur
