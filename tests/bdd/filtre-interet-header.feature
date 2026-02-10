# language: fr
Fonctionnalité: Filtre par intérêt et header fixe (US-5.2)
  Les options d'intérêt sont désignées par concept (intéressé, pas intéressé, pas prononcé).
  Les step definitions résolvent ces clés via la source unique des libellés.

  Contexte:
    Étant donné je suis sur la page d'accueil
    Étant donné je suis connecté

  Scénario: CA1 - Le filtre Intérêt est une liste déroulante à multi-sélection avec les mêmes libellés que les boutons
    Alors la page contient un filtre ou un contrôle intitulé "Intérêt" ou dont le libellé évoque l'intérêt
    Et ce filtre propose les trois options d'intérêt (concepts : intéressé, pas intéressé, pas prononcé)
    Et les options du filtre Intérêt ont les mêmes libellés que les boutons d'intérêt sur les cartes

  Scénario: CA3 - Par défaut toutes les options du filtre Intérêt sont cochées
    Alors le filtre Intérêt a toutes ses options cochées ou sélectionnées
    Et la galerie affiche l'ensemble des souvenirs (aucun filtrage appliqué)

  Scénario: CA2 - Les options cochées du filtre sont combinées par OU
    Quand je décoche uniquement l'option d'intérêt "pas prononcé" dans le filtre Intérêt
    Alors la galerie n'affiche que les souvenirs dont l'intérêt est "intéressé" ou "pas intéressé"
    Et les souvenirs dont l'intérêt est "pas prononcé" ne sont pas affichés

  Scénario: CA4 - Le header (titre et filtres) reste visible au défilement
    Alors la page contient un titre H1 avec le texte "Bienvenue sur la galerie des souvenirs"
    Et la page contient un filtre ou un contrôle intitulé "Intérêt" ou dont le libellé évoque l'intérêt
    Quand je fais défiler le contenu de la page vers le bas
    Alors le titre H1 reste visible dans la zone visible
    Et le filtre Intérêt reste visible dans la zone visible
