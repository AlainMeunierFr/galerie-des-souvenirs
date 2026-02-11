#### US-5.2 : Filtre par intérêt et header fixe

**Statut** : à valider

**En tant que** utilisateur connecté

**Je souhaite** filtrer la galerie par type d'intérêt (intéressé, pas intéressé, pas prononcé) via un contrôle dans le header, et garder toujours visible en haut de page la barre de connexion, le message de bienvenue et les filtres lors du défilement

**Afin de** retrouver rapidement les souvenirs par catégorie d'intérêt et garder le contexte (filtres, titre) à l'écran.

---

**Critères d'acceptation**

- **CA1 - Filtre par intérêt** : Un filtre « Intérêt » est proposé sous forme de contrôle à **choix unique** (une seule option à la fois). La première option est « Sans filtre » (aucun filtrage). Les autres options ont exactement les mêmes libellés que les boutons d'intérêt sur les cartes (Intéressé, Pas intéressé, Pas prononcé). Source unique des libellés (voir contrainte BDD).
- **Contrainte d'implémentation (vocabulaire BDD)** : Les trois libellés d'intérêt sont définis dans **une seule source**. Les scénarios BDD désignent les options par **concept** (clé : `intéressé`, `pas intéressé`, `pas prononcé`). Les step definitions résolvent ces clés vers le libellé courant.
- **CA2 - Logique du filtre** : Une seule option peut être sélectionnée à la fois. Si « Sans filtre » est sélectionné, toute la galerie est visible. Si une option d'intérêt est sélectionnée, la galerie n'affiche que les souvenirs ayant cet intérêt.
- **CA3 - État initial** : Par défaut, « Sans filtre » est sélectionné (aucun filtrage appliqué, toute la galerie visible).
- **CA4 - Header fixe** : La page (zone connectée) comporte un header qui reste visible au défilement. Ce header contient au minimum : le message de bienvenue (titre H1), le ou les filtres (dont le filtre Intérêt) et le réglage de taille des cartes (zoom : Petit ↔ Grand).

---

**Note** : Le contrôle peut afficher toutes les options en permanence (ex. boutons type pills) pour éviter d'avoir à dérouler un menu.
