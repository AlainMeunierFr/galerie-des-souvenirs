# language: fr
Fonctionnalité: Filtre par étiquette (US-5.6)
  Permet à l'utilisateur (normal ou admin) de filtrer la galerie par étiquette
  pour voter par thème ou travailler sur un sous-ensemble thématique.
  Les étiquettes sont créées via US-5.4 (admin).

  Contexte:
    Étant donné je suis sur la page d'accueil
    Étant donné je suis connecté

  # CA1 - Contrôle filtre par étiquette
  Scénario: CA1 - Le filtre Étiquette est un contrôle à multi-sélection dans le header
    Alors la page contient un filtre ou un contrôle intitulé "Étiquette" ou dont le libellé évoque les étiquettes
    Et ce filtre propose une option "Sans étiquette"
    Et le filtre Étiquette est situé dans le header à côté du filtre Intérêt

  Scénario: CA1 - Les options du filtre correspondent aux étiquettes existantes en base
    Étant donné l'étiquette "Vacances" existe en base
    Et l'étiquette "Famille" existe en base
    Alors le filtre Étiquette propose l'option "Vacances"
    Et le filtre Étiquette propose l'option "Famille"
    Et le filtre Étiquette propose l'option "Sans étiquette"

  # CA2 - Logique du filtre (OU)
  Scénario: CA2 - Décocher "Sans étiquette" affiche uniquement les souvenirs ayant au moins une étiquette
    Étant donné la galerie affiche au moins un souvenir
    Et l'étiquette "Vacances" existe en base
    Et au moins un souvenir a l'étiquette "Vacances"
    Et au moins un souvenir n'a aucune étiquette
    Quand je décoche uniquement l'option "Sans étiquette" dans le filtre Étiquette
    Alors la galerie n'affiche que les souvenirs ayant au moins une étiquette
    Et les souvenirs sans étiquette ne sont pas affichés

  Scénario: CA2 - Décocher toutes les étiquettes sauf une affiche uniquement les souvenirs avec cette étiquette
    Étant donné la galerie affiche au moins un souvenir
    Et l'étiquette "Vacances" existe en base
    Et l'étiquette "Famille" existe en base
    Et au moins un souvenir a l'étiquette "Vacances"
    Et au moins un souvenir a l'étiquette "Famille"
    Quand je décoche toutes les options du filtre Étiquette sauf "Vacances"
    Alors la galerie n'affiche que les souvenirs ayant l'étiquette "Vacances"
    Et les souvenirs ayant uniquement l'étiquette "Famille" ne sont pas affichés

  Scénario: CA2 - Étiquette cochée et "Sans étiquette" cochée affichent les souvenirs avec cette étiquette OU sans étiquette
    Étant donné la galerie affiche au moins un souvenir
    Et l'étiquette "Vacances" existe en base
    Et au moins un souvenir a l'étiquette "Vacances"
    Et au moins un souvenir n'a aucune étiquette
    Quand je décoche toutes les options du filtre Étiquette sauf "Vacances" et "Sans étiquette"
    Alors la galerie affiche les souvenirs ayant l'étiquette "Vacances"
    Et la galerie affiche les souvenirs sans étiquette

  # CA3 - État initial
  Scénario: CA3 - Par défaut toutes les options du filtre Étiquette sont cochées
    Alors le filtre Étiquette a toutes ses options cochées ou sélectionnées
    Et la galerie affiche l'ensemble des souvenirs (aucun filtrage appliqué)

  # CA4 - Cohérence header
  Scénario: CA4 - Le filtre Étiquette reste visible dans le header au défilement
    Alors la page contient un filtre ou un contrôle intitulé "Étiquette" ou dont le libellé évoque les étiquettes
    Quand je fais défiler le contenu de la page vers le bas
    Alors le filtre Étiquette reste visible dans la zone visible
