# Revue TDD-front-end — US-5.7 Bouton tout déselectionner

**Date** : 2026-02-11  
**Livrable** : Bouton « Tout déselectionner » + steps `tout-deselectionner.steps.ts`

## Vérifications

- **ESLint** : ✅ `npm run lint` passe sans erreur.
- **Implémentation** : Bouton dans la zone étiquettes (ligne 389-395 GalerieCartes.tsx), visible uniquement si `selectedNoms.size > 0`, clic → `setSelectedNoms(new Set())`.
- **Steps** : 6 step definitions implémentées, réutilisation des steps admin/etiquettes existants.
- **bddgen** : ✅ Passe (avec stubs filtre-etiquette pour US-5.6).
- **test:bdd** : 5 scénarios tout-deselectionner exécutables ; skipped si `ADMIN_TEST_EMAIL`/`ADMIN_TEST_PASSWORD` non configurés (comportement standard des tests admin).
- **Conventions** : `data-testid="bouton-tout-deselectionner"` aligné avec le reste du projet (zone-etiquettes, modal-etiquette, etc.).
- **CA** : CA1 (visibilité), CA2 (comportement), CA3 (admin) couverts par les scénarios BDD.

## Décision

- **filtre-etiquette.steps.ts** : Conservé en stubs pour permettre à bddgen de passer. À remplacer lors du TDD-front-end US-5.6.

## Verdict

**✅ Accepté.** US-5.7 implémentée. Pas de passage Designer nécessaire : le bouton hérite des styles de la zone étiquettes (déjà stylée en US-5.4).
