#### US-5.7 : Bouton tout déselectionner (admin)

**Statut** : implémentée (2026-02-11)

**En tant qu'** administrateur

**Je souhaite** disposer d'un bouton « Tout déselectionner » lorsque j'ai sélectionné des souvenirs

**Afin de** vider la sélection en un clic après une affectation d'étiquettes, sans avoir à décocher manuellement chaque carte.

---

**Critères d'acceptation**

- **CA1 - Visibilité du bouton** :
  - Le bouton « Tout déselectionner » est affiché dans la zone étiquettes (US-5.4), à côté du bouton « Ajouter étiquette » et de la liste des étiquettes.
  - Il n'est visible que lorsqu'au moins un souvenir est coché ; en l'absence de sélection, il n'est pas affiché (ou est masqué).

- **CA2 - Comportement au clic** :
  - Un clic sur « Tout déselectionner » décoche toutes les cases à cocher des cartes actuellement sélectionnées.
  - La zone étiquettes disparaît ou se masque (conformément à US-5.4 : en l'absence de sélection, la zone n'est pas affichée).

- **CA3 - Réservé à l'administrateur** :
  - Ce bouton n'est visible que pour l'administrateur ; les utilisateurs non administrateurs ne voient pas la zone étiquettes ni ce bouton.

---

**Note** : Cette US complète US-5.4 (étiquettes) et US-5.5 (sélection Shift) en offrant une action inverse rapide pour annuler la sélection en cours.
