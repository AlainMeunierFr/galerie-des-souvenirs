# language: fr
Fonctionnalité: Privilèges administrateur (US-5.3)
  L'utilisateur dont l'email de session est alain@maep.fr est reconnu comme administrateur.
  Il voit un bouton "Supprimer" sur chaque carte à la place des trois boutons d'intérêt, et peut supprimer un souvenir après confirmation.

  Contexte:
    Étant donné je suis sur la page d'accueil

  @skip
  Scénario: CA1 - L'utilisateur connecté avec alain@maep.fr est reconnu comme administrateur
    Étant donné je suis connecté en tant qu'administrateur
    Alors l'application me considère comme administrateur

  Scénario: CA1 - L'utilisateur connecté avec un autre email n'est pas administrateur
    Étant donné je suis connecté en tant qu'utilisateur non administrateur
    Alors l'application ne me considère pas comme administrateur

  @skip
  Scénario: CA2 - L'administrateur voit le bouton Supprimer et pas les trois boutons d'intérêt sur les cartes
    Étant donné je suis connecté en tant qu'administrateur
    Alors les cartes de la galerie n'affichent pas les trois boutons d'intérêt (Intéressé, Pas intéressé, Pas prononcé)
    Et les cartes de la galerie affichent un bouton "Supprimer"

  Scénario: CA2 - L'utilisateur non administrateur voit les trois boutons d'intérêt et pas le bouton Supprimer
    Étant donné je suis connecté en tant qu'utilisateur non administrateur
    Alors les cartes de la galerie affichent les trois boutons d'intérêt (Intéressé, Pas intéressé, Pas prononcé)
    Et les cartes de la galerie n'affichent pas de bouton "Supprimer"

  @skip
  Scénario: CA3 - Clic sur Supprimer ouvre une pop-up de confirmation
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Quand je clique sur le bouton "Supprimer" d'une carte de la galerie
    Alors une pop-up ou un dialogue modal m'invite à confirmer la suppression

  @skip
  Scénario: CA3 - Confirmation dans la pop-up supprime le souvenir (base et dossiers)
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Quand je clique sur le bouton "Supprimer" d'une carte de la galerie
    Et une pop-up de confirmation s'affiche
    Et je confirme la suppression dans la pop-up
    Alors le souvenir est supprimé de la base de données
    Et les fichiers du souvenir du dossier Done sont déplacés vers data/input/trash
    Et les fichiers du souvenir des dossiers Webp et miniatures sont supprimés

  @skip
  Scénario: CA3 - Annulation ou fermeture de la pop-up n'effectue aucune suppression
    Étant donné je suis connecté en tant qu'administrateur
    Et la galerie affiche au moins un souvenir
    Quand je clique sur le bouton "Supprimer" d'une carte de la galerie
    Et une pop-up de confirmation s'affiche
    Et j'annule ou je ferme la pop-up sans confirmer
    Alors le souvenir n'est pas supprimé
    Et les fichiers du souvenir restent présents (Done, Webp et miniatures inchangés)
