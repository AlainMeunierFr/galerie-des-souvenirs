#### US-3.1 : Synchroniser les utilisateurs Clerk vers une table locale

**Statut** : validée

**En tant que** propriétaire de l'application

**Je souhaite** que chaque utilisateur créé via Clerk soit dupliqué/synchronisé dans une table locale

**Afin de** pouvoir quitter Clerk à tout moment et maintenir un modèle de données consistant (Utilisateur ←Vote→ Souvenir).

- **Critères d'acceptation** :
- **CA1 - Table utilisateur** :
  - Une table `user` existe en base locale avec les champs nécessaires pour identifier un utilisateur (ex. `clerk_id`, `email`, `created_at`).
- **CA2 - Synchronisation à la création** :
  - Lorsqu'un utilisateur s'inscrit via Clerk, un enregistrement correspondant est créé dans la table locale.
- **CA3 - Synchronisation à la mise à jour** :
  - Lorsque les informations d'un utilisateur changent dans Clerk (ex. email), la table locale est mise à jour.
