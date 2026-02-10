@TDD-front-end

Tu es l'agent TDD front-end. US en cours : **US-5.2 — Filtre par intérêt et header fixe** (voir `.cursor/sprints/US en cours.md` et `.cursor/sprints/2026-02-09 - Message de bienvenue/US-5.2 - Filtre par intérêt et header fixe.md`).

**Contexte** : Le TDD-back-end a livré `utils/interetLabels.ts` (getInteretLabel(cle), getInteretOptions()). Tu dois :
- Afficher un **header de page** (zone connectée) qui reste visible au défilement (titre H1 + filtres), structure prête pour le sticky (classe ou attribut, le Designer fera le CSS).
- Ajouter un **filtre Intérêt** : liste déroulante à multi-sélection, libellés via getInteretOptions(), logique **OU** sur les options cochées, **par défaut toutes cochées**.
- Utiliser la **source unique** pour les libellés : boutons des cartes et filtre utilisent getInteretOptions() / getInteretLabel() (refactorer CarteSouvenir si besoin).
- Implémenter **toutes les step definitions** des scénarios dans `tests/bdd/filtre-interet-header.feature` ; résoudre les clés (ex. "pas prononcé") via getInteretLabel() pour trouver les éléments dans le DOM.
- Exécuter **npm run test:bdd** avant de considérer la livraison terminée ; ne pas livrer avec des steps manquants.

**Plan de tests baby steps** (à suivre strictement, un test à la fois — RED → GREEN → refactor) :

1. **Refactor CarteSouvenir** : Les libellés des 3 boutons viennent de getInteretOptions() (ou getInteretLabel). Test unitaire : les boutons affichent les libellés de la source (ex. getByRole('button', { name: 'Intéressé' }) etc.).
2. **Header de page** : Dans HomePageContent (SignedIn), une zone header contient le H1 et un emplacement pour les filtres ; cette zone a une classe/attribut pour sticky (ex. data-layout ou className pour que le Designer puisse appliquer position:sticky). Test : structure DOM (H1 + zone filtres).
3. **Composant FiltreInteret** : Liste déroulante (ou menu) multi-sélection avec les 3 options issues de getInteretOptions(), état = ensemble des clés cochées, initial = les 3. Test : rendu des 3 options, toutes cochées par défaut.
4. **Filtrage galerie** : GalerieCartes reçoit les clés sélectionnées (Set ou array) ; affiche les souvenirs dont l'intérêt (interets[nom]) appartient à l'une des clés (OR). Mapping clé ↔ InteretValeur : intéressé→oui, pas intéressé→non, pas prononcé→null. Test : en décochant une option, les cartes filtrées correspondent.
5. **Step definitions** : Créer ou compléter un fichier de steps (ex. filtre-interet-header.steps.ts ou étendre accueil.steps) pour tous les steps de filtre-interet-header.feature. Utiliser getInteretLabel(cle) pour les libellés affichés. Steps à couvrir : filtre présent, trois options, mêmes libellés que boutons, toutes cochées, galerie entière, décocher option "pas prononcé", galerie filtrée, défilement, H1 et filtre restent visibles.
6. **Vérification BDD** : Lancer npm run test:bdd ; corriger jusqu'à ce que les scénarios US-5.2 passent.

**Contraintes** : Pas de CSS (structure et classes uniquement). e2eID sur les éléments interactifs (règle e2eid-convention.mdc). Ne pas modifier les fichiers .feature.
