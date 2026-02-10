# language: fr
Fonctionnalité: Afficher la galerie (US-2.1)

  Contexte:
    Étant donné je suis sur la page d'accueil

  Scénario: CA1 - Page non connectée affiche le titre centré et l'invitation
    Étant donné je ne suis pas connecté
    Alors la page contient un titre H1 avec le texte "Bienvenue sur la galerie des souvenirs"
    Et le titre H1 est centré horizontalement dans la zone visible
    Et la page contient un sous-titre H2 avec le texte "Connectez-vous ou créez-vous un compte utilisateur"

  Scénario: CA2 - Page connectée affiche le H1 en haut à gauche
    Étant donné je suis connecté
    Alors la page contient un titre H1 avec le texte "Bienvenue sur la galerie des souvenirs"
    Et le titre H1 est en haut à gauche de la zone de contenu

  Scénario: CA3 - Page connectée affiche la galerie sur 4 colonnes
    Étant donné je suis connecté
    Alors la page contient une galerie de photos
    Et la galerie est affichée sur 4 colonnes
