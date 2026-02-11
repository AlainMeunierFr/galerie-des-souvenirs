#### US-5.6 : Filtre par étiquette (voter par thème)

**Statut** : validée (2026-02-11)

**En tant que** utilisateur connecté (normal ou administrateur)

**Je souhaite** filtrer la galerie par étiquette via un contrôle dans le header

**Afin de** voter par thème (ou travailler sur un sous-ensemble thématique de souvenirs).

---

**Critères d'acceptation**

- **CA1 - Contrôle filtre par étiquette** :
  - Un filtre « Étiquette » est proposé dans le header (à côté du filtre Intérêt), sous forme de contrôle à multi-sélection (ex. cases à cocher ou liste déroulante).
  - Les options affichées correspondent à toutes les étiquettes existantes en base (créées via US-5.4).
  - Une option « Sans étiquette » permet d'inclure les souvenirs n'ayant aucune étiquette.

- **CA2 - Logique du filtre** :
  - Les options cochées sont combinées par **OU** : la galerie affiche les souvenirs qui ont **au moins une** des étiquettes cochées, ou qui sont « Sans étiquette » si cette option est cochée.
  - Si une étiquette est cochée et « Sans étiquette » aussi : afficher les souvenirs qui ont cette étiquette OU qui n'ont aucune étiquette.

- **CA3 - État initial** :
  - Par défaut, toutes les options sont cochées (aucun filtrage appliqué, toute la galerie visible).

- **CA4 - Cohérence avec le header** :
  - Le filtre Étiquette s'intègre dans le header fixe existant (US-5.2), sans le modifier structurellement.

---

**Note** : Cette US concrétise le filtre par étiquette annoncé en US-5.4 (« recherche dans une US ultérieure »). L'utilisateur normal vote via les boutons d'intérêt ; l'administrateur peut filtrer pour gérer un sous-ensemble thématique.

**⚠️ Attention technique** : Un autre agent est en train de supprimer toute dépendance à Muuri. Pour la partie front-end (TDD-front-end, Designer), faire attention à la structure DOM/CSS de la galerie et des filtres — ou envisager d'attendre la fin du nettoyage avant d'implémenter.
