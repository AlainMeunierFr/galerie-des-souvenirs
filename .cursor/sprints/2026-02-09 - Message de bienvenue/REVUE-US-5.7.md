# Revue US-5.7 — Bouton tout déselectionner (admin)

**Date** : 2026-02-11

## Contexte

Revue de l'US rédigée pour le bouton « Tout déselectionner » permettant à l'admin de vider la sélection en un clic après une affectation d'étiquettes.

## Vérifications

- **Format** : Titre H4, Statut, En tant que / Je souhaite / Afin de, Critères d'acceptation → conforme.
- **CA1** : Bouton dans la zone étiquettes, visible uniquement si au moins un souvenir coché → testable (DOM, visibilité).
- **CA2** : Clic décoche toutes les cartes, zone étiquettes disparaît → testable (comportement).
- **CA3** : Réservé à l'admin (cohérent avec US-5.4) → pas de régression.
- **Cohérence** : Aligné avec US-5.4 (zone étiquettes) et US-5.5 (sélection).
- **Un seul périmètre** : pas de code ni de .feature dans la livraison US → conforme.

## Verdict

**US-5.7 validée** (document). Prête pour l'étape **BDD** (rédaction des scénarios .feature).

**Prochaine action** : au prochain GO NEXT, passage à l'agent BDD.
