# Environnement technique

Stack : Clerk (auth) + Mantine (UI) + Turso (BDD) + Tailwind CSS.

## Première installation

**Obligatoire avant `npm run build` ou `npm run dev` :**

1. `cp .env.example .env.local`
2. Créer une app Clerk sur [dashboard.clerk.com](https://dashboard.clerk.com) → récupérer les clés
3. Renseigner `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dans `.env.local`

Sans ces clés, le build échoue (Clerk les exige au démarrage).

**Important** : le fichier `.env.local` doit être **à la racine du projet** (à côté de `package.json`), pas dans `app/`. Next.js ne charge les variables d'environnement que depuis la racine. Si tes clés sont dans `app/.env.local`, déplace-les vers `.env.local` à la racine, puis redémarre le serveur de dev (`npm run dev`).

## Variables d'environnement

### Clerk
1. Créer une application sur [dashboard.clerk.com](https://dashboard.clerk.com)
2. Récupérer `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` (page API keys du dashboard)
3. (Optionnel) Pour les scénarios BDD « visiteur connecté » : ajouter `CLERK_TEST_EMAIL` et `CLERK_TEST_PASSWORD` dans `.env.local`
4. (Optionnel) Pour la sync utilisateurs : créer un webhook dans [Clerk Dashboard](https://dashboard.clerk.com/~/webhooks) → URL `https://votre-domaine/api/webhooks/clerk`, s'abonner à `user.created` et `user.updated`, puis ajouter `CLERK_WEBHOOK_SIGNING_SECRET` dans `.env.local`

### Turso (obligatoire)
- **Cloud :** [turso.tech](https://turso.tech) → créer une DB → `turso db show <nom> --url` et `turso db tokens create <nom>`
- Renseigner `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` dans `.env.local` (et sur Vercel pour la prod). **Aucun fallback sur un fichier local** : sans ces variables, l'app et les scripts `db:inspect` / `db:init` refusent de démarrer.

### Vercel Blob (obligatoire pour les images)
- **Stockage partagé dev/prod** : les images (miniatures, webp) sont dans Vercel Blob.
- Créer un Blob store : Vercel Dashboard → projet → Storage → Create Blob.
- Récupérer `BLOB_READ_WRITE_TOKEN` (créé automatiquement) et l'ajouter dans `.env.local` et sur Vercel.
- En local : `vercel env pull` pour synchroniser les variables.

## Utilisation

- **Clerk :** `<SignInButton />`, `<SignUpButton />`, `<UserButton />`, `auth()` (server), `useUser()` (client)
- **Mantine :** Composants `@mantine/core`, hooks `@mantine/hooks`
- **Turso :** `import { db } from '@/lib/db'` → `db.execute('SELECT ...')`

---

## Déploiement Vercel + base partagée dev/prod

### Clerk sur Vercel

Rien ne s’active tout seul. Tu choisis quelle app Clerk utilise la prod :

- **Même app que le dev** : recopie dans Vercel (Settings → Environment Variables) les mêmes `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` que dans `.env.local`.
- **App « Production » dédiée** : dans [Clerk Dashboard](https://dashboard.clerk.com), crée une instance « Production » (ou une 2ᵉ app), récupère ses clés et mets **celles-ci** dans Vercel. Les inscrits en prod seront distincts du dev.

### Base de données sur Vercel

Sur Vercel il n’y a **pas de disque persistant**. La base Turso (cloud) est utilisée en dev et en prod.

- **Turso (recommandé)** : [turso.tech](https://turso.tech), compte gratuit possible.
  1. Créer une base : `turso db create galerie-prod` (ou via le site).
  2. Récupérer l’URL : `turso db show galerie-prod --url`.
  3. Créer un token : `turso db tokens create galerie-prod`.
  4. Dans Vercel : ajouter `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` (même noms que dans `.env.example`).

### Même base pour dev et prod

Pour que **dev** (où tu alimentes la BDD en photos) et **prod** (où les gens votent) utilisent la **même** base :

1. **Une seule base Turso** (ex. `galerie-prod` ou `galerie-shared`).
2. **En local** : dans `.env.local`, définir les **mêmes** `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` que sur Vercel.
3. **Sur Vercel** : les mêmes variables sont déjà configurées (voir ci‑dessus).

Résultat : la même BDD et le même Blob sont utilisés en local et en prod ; tu peux ajouter des photos en dev et les voir en prod.

### Migration depuis data/ vers Blob
Si tu avais des images dans `data/souvenirs/` avant la migration :
```bash
npm run souvenir:migrate-to-blob
```
Puis vérifier avec `npm run db:souvenirs-sync` si besoin.

### Base vierge : créer les tables

Aucun script ne détecte automatiquement une base vide au démarrage. Pour une **base Turso vierge**, exécute une fois :

```bash
npm run db:init
```

(avec `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` dans `.env.local`). Cela crée la table `user` si elle n’existe pas. Sinon, la table est aussi créée au **premier passage du webhook Clerk** (inscription ou mise à jour de profil).

### Consulter la base Turso

- **En ligne de commande** (CLI Turso) :  
  `turso db shell galerie-prod`  
  Puis du SQL : `SELECT * FROM user;`, etc.

- **Depuis le projet** : avec `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` dans ton environnement (ex. `.env.local` chargé), exécuter :  
  `npm run db:inspect`  
  Le script lit la base Turso configurée dans `.env.local`.

---

## Dépannage Clerk (dev)

### Pop-up « Missing environment keys » alors que les clés sont renseignées

- Vérifier que **`.env.local` est à la racine du projet** (pas dans `app/`). Next.js ne charge que les `.env*` à la racine.
- Noms exacts des variables : `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` (sans faute de frappe).
- Après toute modification de `.env.local`, **redémarrer** le serveur de dev (`Ctrl+C` puis `npm run dev`). Next.js lit les variables au démarrage.
- Si tu as « claimé » l’app dans le Clerk Dashboard sans avoir encore mis tes propres clés, remplace bien par les clés de l’onglet **API Keys** du dashboard.

### Erreur 422 sur la connexion (console : `[Clerk Debug] request failed ... sign_ins status 422`)

- **422** = requête refusée (identifiants invalides ou configuration). À vérifier :
  - Mot de passe correct pour l’email en question.
  - Dans le [Clerk Dashboard](https://dashboard.clerk.com) → ton application → **User & Authentication** → **Email, Phone, Username** : la méthode **Email address** + **Password** doit être activée pour la connexion.
- Souvent, après un « Log out », l’ancienne session reste en cookie ; si la **nouvelle** tentative de connexion échoue (422), tu restes « connecté » avec l’ancien utilisateur. Corriger la cause du 422 (mot de passe, config Clerk), puis **vider les cookies du site** pour `localhost` (ou ouvrir une fenêtre de navigation privée) et réessayer la connexion avec `alain@maep.fr`.

### Déconnexion puis reconnexion avec un autre utilisateur : on reste l’ancien utilisateur

- Si la nouvelle connexion échoue (ex. 422), Clerk ne remplace pas la session : tu restes l’ancien utilisateur.
- Faire un **Log out** puis, avant de te reconnecter, vider les cookies pour `localhost` (DevTools → Application → Cookies → supprimer pour `localhost`) ou utiliser une **fenêtre privée**.
- Ensuite ressaisir email et mot de passe. Si l’email de confirmation n’est pas envoyé, c’est normal pour un compte **déjà existant** : la confirmation par email est en général pour l’**inscription** (Sign up), pas pour le Sign in.
