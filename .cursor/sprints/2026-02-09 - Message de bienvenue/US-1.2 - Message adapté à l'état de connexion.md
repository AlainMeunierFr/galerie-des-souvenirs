#### US-1.2 : Message adapté à l'état de connexion

**Statut** : ✅ done (code livré — build nécessite Clerk keys dans .env.local)

**En tant que** visiteur du site

**Je souhaite** voir un message différent selon que je suis connecté ou non

**Afin de** savoir quoi faire (me connecter ou créer un compte) ou accéder au contenu (les photos).

- **Critères d'acceptation** :
- **CA1 - Visiteur non connecté** :
  - Sous le message de bienvenue (H1 actuel), après trois sauts de ligne, s'affiche un sous-titre H2 : « Connectez-vous ou créez-vous un compte utilisateur ».
- **CA2 - Visiteur connecté** :
  - Sous le message de bienvenue, après trois sauts de ligne, s'affiche le texte : « Voici les photos ».
