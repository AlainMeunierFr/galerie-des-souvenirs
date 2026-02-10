# Revue US-5.4 — TDD-back-end (Étiquettes sur les souvenirs, admin)

**Date** : 2026-02-10

## Contexte

Revue de la livraison **agent TDD-back-end** pour US-5.4 : modèle étiquettes (N–N avec souvenirs), port EtiquetteRepository, adaptateur Libsql, API admin (GET/POST etiquettes, assign, unassign, état panachage).

## Vérifications

- **ESLint** : `npm run lint` → OK.
- **Architecture hexagonale** : Port `EtiquetteRepository` dans `utils/domain/ports/`, adaptateur `LibsqlEtiquetteRepository` dans `utils/adapters/`, API dans `app/api/etiquettes/` → OK.
- **Modèle** : Tables `etiquette` (id, libelle UNIQUE) et `souvenir_etiquette` (souvenir_nom, etiquette_id) avec schémas + ensure*Table → OK.
- **Port** : ensureTables, create, listAll, assign, unassign, getSouvenirNomsWithEtiquette → OK.
- **Règles métier** : libellé non vide (throw), unicité (erreur explicite 409 côté API), assign/unassign par liste de noms → OK.
- **API** : GET /api/etiquettes, POST (libelle + optionnel souvenir_noms), POST [id]/assign, POST [id]/unassign, GET [id]/souvenirs?noms=… (panachage) ; toutes protégées admin (auth + isAdminEmail) → OK.
- **Tests** : 8 tests d’intégration (`tests/integration/etiquettes.integration.test.ts`) couvrant tables, create (ok/vide/doublon), listAll, assign, unassign, getSouvenirNomsWithEtiquette → OK.
- **Périmètre** : Aucun composant UI (pas de cases à cocher ni pop-up) → conforme.

## BDD

Les scénarios US-5.4 dans `etiquettes-admin.feature` sont E2E (UI). Ils sont actuellement **skipped** car le front n’existe pas encore. Les step definitions sont en place ; ils passeront après livraison **TDD-front-end**.

## Verdict

**TDD-back-end US-5.4 validé.** Prêt pour **TDD-front-end** (cases à cocher admin, zone étiquettes, pop-up création, liste étiquettes, assign/unassign/panachage en appelant les API livrées).
