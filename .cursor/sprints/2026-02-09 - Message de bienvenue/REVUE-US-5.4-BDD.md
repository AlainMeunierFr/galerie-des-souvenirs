# Revue BDD — US-5.4 Étiquettes sur les souvenirs (admin)

**Date** : 2026-02-10  
**Livrable** : `tests/bdd/etiquettes-admin.feature` + `tests/bdd/etiquettes-admin.steps.ts`

## Vérifications

- **ESLint** : ✅ `npm run lint` passe sans erreur ni warning (nettoyage des variables inutilisées effectué en revue).
- **bddgen** : ✅ Tous les steps ont une définition (aucun step manquant).
- **Couverture des CA** : ✅ CA1 (2 scénarios), CA2 (2), CA3 (3), CA4 (3) — 10 scénarios au total.
- **Conventions** : Feature en français, réutilisation des steps admin (connecté admin / non-admin, galerie affiche…), usage de rôles et `data-testid` pour les nouveaux éléments (zone-etiquettes, modal-etiquette).
- **Cohérence** : Même structure que les autres features (Contexte, Scénario avec libellés CA).

## Décisions / remarques

- Les `Given` d’état préparé (étiquette existe, n’existe pas, panachage) sont des no-ops en E2E : l’implémentation future (TDD back-end / fixtures ou données de test) devra fournir ces états ou les scénarios seront à exécuter dans un ordre donné.
- Les steps « l’étiquette X est désaffectée » ne font qu’un `networkidle` ; une assertion sur l’UI (étiquette absente des cartes cochées) pourra être ajoutée au moment du TDD front-end si le rendu le permet.

## Verdict

**✅ Accepté.** BDD US-5.4 prête pour l’étape TDD back-end (modèle étiquettes, API, persistence).
