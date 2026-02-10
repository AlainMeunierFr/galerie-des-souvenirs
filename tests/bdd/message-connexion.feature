# language: fr
Fonctionnalité: Message adapté à l'état de connexion (US-1.2)

  Contexte:
    Étant donné je suis sur la page d'accueil

  Scénario: CA1 - Visiteur non connecté voit l'invitation à se connecter
    Étant donné je ne suis pas connecté
    Alors la page contient un sous-titre H2 avec le texte "Connectez-vous ou créez-vous un compte utilisateur"

  Scénario: CA2 - Visiteur connecté voit le message des photos
    Étant donné je suis connecté
    Alors la page contient le texte "Voici les photos"
