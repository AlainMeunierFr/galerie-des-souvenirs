# language: fr
Fonctionnalité: Message de bienvenue (US-1.1)

  Contexte:
    Étant donné je suis sur la page d'accueil

  Scénario: CA1 - Le titre H1 affiche le message de bienvenue
    Alors la page contient un titre H1 avec le texte "Bienvenue sur la galerie des souvenirs"

  Scénario: CA2 - Le titre est centré horizontalement et verticalement
    Alors le titre H1 est centré horizontalement dans la zone visible
    Et le titre H1 est centré verticalement dans la zone visible

  Scénario: CA2 - Le centrage est conservé sur mobile
    Étant donné la largeur du viewport est 375px
    Alors le titre H1 est centré horizontalement dans la zone visible
    Et le titre H1 est centré verticalement dans la zone visible

  Scénario: CA2 - Le centrage est conservé sur desktop
    Étant donné la largeur du viewport est 1920px
    Alors le titre H1 est centré horizontalement dans la zone visible
    Et le titre H1 est centré verticalement dans la zone visible
