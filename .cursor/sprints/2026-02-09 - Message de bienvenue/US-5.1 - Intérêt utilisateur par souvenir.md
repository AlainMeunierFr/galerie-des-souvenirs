#### US-5.1 : Intérêt utilisateur par souvenir

**Statut** : en cours (back-end + front cartes livrés)

**En tant que** utilisateur

**Je souhaite** savoir à tout moment pour quel souvenir j'ai un intérêt, lesquels j'ai exclus, et lesquels ne sont pas encore arbitrés

**Afin de** donner mon avis sur tout.

---

**Modèle de données**

| Table | Rôle |
|-------|------|
| `interet` | Lie utilisateur et souvenir. Relation User ← Interet → Souvenir |

| Colonne | Type | Valeurs | Signification |
|---------|------|---------|---------------|
| `interet` | TEXT ou INTEGER | `null` | Non prononcé (pas encore arbitré) |
| | | `oui` / 1 | Intéressé |
| | | `non` / 0 | Pas intéressé (exclu) |

---

**Interface galerie**

- Chaque photo est présentée dans une **carte** (ou vignette)
- Sur chaque carte figurent la photo et **3 boutons** :
  1. **Intéressé** — marque le souvenir comme « oui »
  2. **Pas intéressé** — marque le souvenir comme « non »
  3. **Pas prononcé** — réinitialise à `null` (non arbitré)

---

**Critères d'acceptation**

- **CA1 - Table interet** : Une table `interet` existe en base avec les colonnes nécessaires pour lier `user` et `souvenir`, et stocker la valeur d'intérêt (`null` / oui / non).
- **CA2 - Affichage des boutons** : Chaque souvenir de la galerie est affiché sur une carte avec les 3 boutons (Intéressé, Pas intéressé, Pas prononcé).
- **CA3 - Persistance** : Un clic sur un bouton enregistre ou met à jour l'intérêt de l'utilisateur connecté pour ce souvenir en base.
- **CA4 - Indication visuelle** : L'état actuel de l'intérêt est visible (bouton actif / surligné selon le choix).
- **CA5 - Filtrage (optionnel)** : Possibilité de filtrer ou distinguer les souvenirs par catégorie (intéressés, exclus, non arbitrés).
