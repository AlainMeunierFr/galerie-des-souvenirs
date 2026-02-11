#### US-5.6 : Filtre par étiquette (voter par thème)

**Statut** : validée (2026-02-11)

**En tant que** utilisateur connecté (normal ou administrateur)

**Je souhaite** filtrer la galerie par étiquette via un contrôle dans le header

**Afin de** voter par thème (ou travailler sur un sous-ensemble thématique de souvenirs).

---

**Critères d'acceptation**

- **CA1 - Contrôle filtre par étiquette** :
  - Un filtre « Étiquette » est proposé dans le header (à côté du filtre Intérêt), sous forme de contrôle à **choix unique** (une seule option à la fois).
  - La première option est « Sans filtre » (aucun filtrage). Les options affichées correspondent aux étiquettes existantes en base (créées via US-5.4), **à l'exclusion des étiquettes réservées à l'admin** (libellé commençant par `*`, visibles uniquement pour l'administrateur).
  - Une option « Sans étiquette » permet de n'afficher que les souvenirs n'ayant aucune étiquette.

- **CA2 - Logique du filtre** : Une seule option peut être sélectionnée. Si « Sans filtre » est sélectionné, toute la galerie est visible (sous réserve du filtre Intérêt). Si une étiquette (ou « Sans étiquette ») est sélectionnée, la galerie n'affiche que les souvenirs ayant cette étiquette, ou sans étiquette si « Sans étiquette » est choisi.

- **CA3 - État initial** : Par défaut, « Sans filtre » est sélectionné (aucun filtrage par étiquette, toute la galerie visible).

- **CA4 - Cohérence avec le header** : Le filtre Étiquette s'intègre dans le header fixe existant (US-5.2).

---

**Note** : Les étiquettes dont le libellé commence par `*` ne sont affichées ni sur les cartes ni dans le filtre pour les utilisateurs non administrateurs (comportement implémenté en dehors de cette US).
