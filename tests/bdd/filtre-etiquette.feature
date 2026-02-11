# language: fr
Fonctionnalité: Filtre par étiquette (US-5.6)
  Permet à l'utilisateur (normal ou admin) de filtrer la galerie par étiquette
  pour voter par thème ou travailler sur un sous-ensemble thématique.
  Les étiquettes sont créées via US-5.4 (admin). Une seule option à la fois ; « Sans filtre » = tout afficher.

  Contexte:
    Étant donné je suis sur la page d'accueil
    Étant donné je suis connecté en tant qu'administrateur

  # CA1 - Contrôle filtre par étiquette
  Scénario: CA1 - Le filtre Étiquette est un contrôle à choix unique dans le header
    Alors la page contient un filtre ou un contrôle intitulé "Étiquette" ou dont le libellé évoque les étiquettes
    Et ce filtre propose une option "Sans filtre"
    Et ce filtre propose une option "Sans étiquette"
    Et le filtre Étiquette est situé dans le header à côté du filtre Intérêt

  @skip
  Scénario: CA1 - Les options du filtre correspondent aux étiquettes existantes en base
    Étant donné l'étiquette "pour les tests" existe en base
    Alors le filtre Étiquette propose l'option "pour les tests"
    Et le filtre Étiquette propose l'option "Sans étiquette"
    Et je supprime l'étiquette "pour les tests" pour remettre en place

  # CA2 - Logique du filtre (choix unique)
  @skip
  Scénario: CA2 - Sélectionner "Sans étiquette" affiche uniquement les souvenirs sans étiquette
    Étant donné la galerie affiche au moins un souvenir
    Et l'étiquette "pour les tests" existe en base
    Et au moins un souvenir a l'étiquette "pour les tests"
    Et au moins un souvenir n'a aucune étiquette
    Quand je sélectionne l'option "Sans étiquette" dans le filtre Étiquette
    Alors la galerie n'affiche que les souvenirs sans étiquette
    Et les souvenirs ayant l'étiquette "pour les tests" ne sont pas affichés
    Et je supprime l'étiquette "pour les tests" pour remettre en place

  @skip
  Scénario: CA2 - Sélectionner une étiquette affiche uniquement les souvenirs avec cette étiquette
    Étant donné la galerie affiche au moins un souvenir
    Et l'étiquette "pour les tests" existe en base
    Et au moins un souvenir a l'étiquette "pour les tests"
    Quand je sélectionne l'option "pour les tests" dans le filtre Étiquette
    Alors la galerie n'affiche que les souvenirs ayant l'étiquette "pour les tests"
    Et je supprime l'étiquette "pour les tests" pour remettre en place

  # CA3 - État initial
  @skip
  Scénario: CA3 - Par défaut "Sans filtre" est sélectionné dans le filtre Étiquette
    Alors le filtre Étiquette a "Sans filtre" sélectionné
    Et la galerie affiche l'ensemble des souvenirs (aucun filtrage appliqué)

  # CA4 - Cohérence header
  @skip
  Scénario: CA4 - Le filtre Étiquette reste visible dans le header au défilement
    Alors la page contient un filtre ou un contrôle intitulé "Étiquette" ou dont le libellé évoque les étiquettes
    Quand je fais défiler le contenu de la page vers le bas
    Alors le filtre Étiquette reste visible dans la zone visible
