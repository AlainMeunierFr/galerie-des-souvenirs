# Environnement technique

Stack : Clerk (auth) + Mantine (UI) + Turso (BDD) + Tailwind CSS.

## Première installation

**Obligatoire avant `npm run build` ou `npm run dev` :**

1. `cp .env.example .env.local`
2. Créer une app Clerk sur [dashboard.clerk.com](https://dashboard.clerk.com) → récupérer les clés
3. Renseigner `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dans `.env.local`

Sans ces clés, le build échoue (Clerk les exige au démarrage).

## Variables d'environnement

### Clerk
1. Créer une application sur [dashboard.clerk.com](https://dashboard.clerk.com)
2. Récupérer `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` (page API keys du dashboard)
3. (Optionnel) Pour les scénarios BDD « visiteur connecté » : ajouter `CLERK_TEST_EMAIL` et `CLERK_TEST_PASSWORD` dans `.env.local`
4. (Optionnel) Pour la sync utilisateurs : créer un webhook dans [Clerk Dashboard](https://dashboard.clerk.com/~/webhooks) → URL `https://votre-domaine/api/webhooks/clerk`, s'abonner à `user.created` et `user.updated`, puis ajouter `CLERK_WEBHOOK_SIGNING_SECRET` dans `.env.local`

### Turso (obligatoire)
- **Cloud :** [turso.tech](https://turso.tech) → créer une DB → `turso db show <nom> --url` et `turso db tokens create <nom>`
- Renseigner `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` dans `.env.local` (et sur Vercel pour la prod). **Aucun fallback sur un fichier local** : sans ces variables, l’app et les scripts `db:inspect` / `db:init` refusent de démarrer.

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

Résultat : la même BDD est utilisée en local et en prod ; tu peux ajouter des photos en dev et les voir en prod.

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
