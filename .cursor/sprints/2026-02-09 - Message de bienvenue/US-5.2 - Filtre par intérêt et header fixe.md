#### US-5.2 : Filtre par intérêt et header fixe

**Statut** : à valider

**En tant que** utilisateur connecté

**Je souhaite** filtrer la galerie par type d'intérêt (intéressé, pas intéressé, pas prononcé) via un menu à choix multiples, et garder toujours visible en haut de page la barre de connexion, le message de bienvenue et les filtres lors du défilement

**Afin de** retrouver rapidement les souvenirs par catégorie d'intérêt et garder le contexte (filtres, titre) à l'écran.

---

**Critères d'acceptation**

- **CA1 - Filtre par intérêt** : Un filtre « Intérêt » est proposé sous forme de liste déroulante à multi-sélection. Les options ont exactement les mêmes libellés que les boutons d'intérêt sur les cartes (Intéressé, Pas intéressé, Pas prononcé). Si les libellés des boutons changent, ceux du filtre changent aussi (source unique).
- **Contrainte d'implémentation (vocabulaire BDD)** : Les trois libellés d'intérêt sont définis dans **une seule source** (ex. 3 constantes nommées) pour faciliter le paramétrage. Les scénarios BDD désignent les options par **concept** (clé : `intéressé`, `pas intéressé`, `pas prononcé`), pas par le libellé affiché. Les step definitions résolvent ces clés vers le libellé courant via cette source. Ainsi, un changement de libellé ne nécessite qu’une mise à jour des constantes et les BDD ne régressent pas.
- **CA2 - Logique du filtre** : Les éléments cochés dans le menu sont combinés par **OU** : la galerie affiche les souvenirs dont l'intérêt appartient à l'une des valeurs cochées.
- **CA3 - État initial** : Par défaut, toutes les options du filtre sont cochées (aucun filtrage appliqué, toute la galerie visible).
- **CA4 - Header fixe** : La page (zone connectée) comporte un header qui reste visible au défilement. Ce header contient au minimum : la ligne Clerk (connexion / UserButton), le message de bienvenue (titre H1), et le ou les filtres (dont le filtre Intérêt). D'autres filtres pourront y être ajoutés plus tard.

---

**Note** : La barre Clerk est déjà dans le layout (header). Le « header » de la page désigne la zone qui reste visible sous la barre Clerk lors du défilement du contenu (message de bienvenue + filtres).
