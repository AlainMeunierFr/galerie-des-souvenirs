#### US-5.5 : Sélection rapide par Shift (admin)

**Statut** : validée (2026-02-10)

**En tant qu'** administrateur

**Je souhaite** pouvoir sélectionner ou désélectionner une série de souvenirs en utilisant la touche Shift (comportement standard d’ergonomie)

**Afin de** aller plus vite lors de l’affectation d’étiquettes à plusieurs photos.

---

**Critères d'acceptation**

- **CA1 - Sélection par plage (Shift + clic)** :
  - Après un premier clic sur la case à cocher d’une carte A, un clic sur la case d’une carte B **en maintenant la touche Shift enfoncée** sélectionne toutes les cartes entre A et B (incluses).
  - La plage est définie par l’ordre d’affichage des cartes dans la galerie (ordre visuel à l’écran).

- **CA2 - Désélection par plage (Shift + clic)** :
  - Si au moins une carte de la plage est déjà cochée : Shift + clic sur une autre carte désélectionne toute la plage entre la dernière carte « ancrage » et la carte cliquée (comportement cohérent avec les sélecteurs de listes standard : tout cocher ou tout décocher la plage selon l’état de la carte cible).

- **CA3 - Ancrage** :
  - La carte sur laquelle l’utilisateur a fait le dernier clic **sans** Shift est l’« ancrage » pour le prochain Shift + clic (comportement type Explorateur Windows / listes de fichiers).

- **CA4 - Pas d’impact hors admin** :
  - Le comportement Shift ne s’applique qu’en mode administrateur (les cases à cocher n’étant visibles que pour l’admin, pas de régression pour les autres utilisateurs).
