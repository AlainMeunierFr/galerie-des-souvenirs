# Revue US-5.5 — TDD-front-end (Sélection Shift)

**Date** : 2026-02-10

## Contexte

Revue de la livraison **TDD-front-end** pour US-5.5 : comportement Shift + clic (ancrage, plage, état de la carte cible).

## Vérifications

- **ESLint** : OK.
- **CA1** : Shift + clic applique l’état de la carte cliquée à toute la plage (min/max ancrage et index cible) → `handleSelectionChange` avec `shiftKey` et `anchorIndex`.
- **CA2** : Même logique : plage mise à l’état `selected` (cochée ou décochée selon la cible) → conforme.
- **CA3** : Clic sans Shift met à jour `anchorIndex` ; Shift + clic utilise cet ancrage → conforme.
- **CA4** : Comportement limité à l’admin (cases à cocher déjà réservées à l’admin en US-5.4) → pas de régression.
- **Implémentation** : `CarteSouvenir` transmet `shiftKey` via ref au `onMouseDown` puis `onChange` ; `GalerieCartes` garde `anchorIndex`, plage basée sur `allNoms` (ordre des cartes) → cohérent avec les steps BDD.

## Verdict

**TDD-front-end US-5.5 validé.** Aucun nouveau visuel : pas de passage Designer. US-5.5 peut être **clôturée**.
