#### US-5.4 : Étiquettes sur les souvenirs (admin)

**Statut** : validée (2026-02-10)

**En tant qu'** administrateur

**Je souhaite** pouvoir sélectionner une série de souvenirs (via une case à cocher) pour leur affecter une « étiquette »

**Afin de** pouvoir retrouver ces images plus tard via une recherche par étiquette (recherche dans une US ultérieure).

---

**Critères d'acceptation**

- **CA1 - Cases à cocher (admin)** :
  - En mode administrateur, chaque carte souvenir affiche une case à cocher dans le coin supérieur gauche, par-dessus l'image.
  - Seul l'administrateur voit ces cases ; les autres utilisateurs ne les voient pas.

- **CA2 - Zone étiquettes (si sélection)** :
  - Lorsqu'au moins un souvenir est coché, s'affichent : un bouton « Ajouter étiquette » et la liste des étiquettes déjà créées.
  - En l'absence de sélection, cette zone n'est pas affichée (ou est masquée).

- **CA3 - Création d'étiquette** :
  - Un clic sur « Ajouter étiquette » ouvre une pop-up avec : un champ de saisie (libellé), un bouton « Annuler », un bouton « Créer ».
  - Si le libellé n'est pas vide, n'existe pas déjà et l'utilisateur clique sur « Créer », la nouvelle étiquette est créée et affectée à tous les souvenirs actuellement cochés.
  - Si le libellé existe déjà, un message approprié est affiché (pas de création en doublon).

- **CA4 - Affectation / désaffectation (étiquette existante)** :
  - Clic sur une étiquette déjà existante (dans la liste) :
    - **Aucun** souvenir coché n'a cette étiquette → l'étiquette est **affectée** à tous les souvenirs cochés.
    - **Tous** les souvenirs cochés ont déjà cette étiquette → l'étiquette est **désaffectée** pour tous les souvenirs cochés.
    - **Panachage** (certains souvenirs cochés ont l'étiquette, d'autres non) → une question est posée avec trois choix : « Supprimer sur tout », « Affecter à tout », « Annuler ». L'action est exécutée selon le choix (désaffecter partout, affecter partout, ou ne rien faire).

---

**Note** : La recherche / filtre par étiquette pour « retrouver les images » fera l'objet d'une US dédiée ultérieure.
