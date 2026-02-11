# Revue BDD — US-5.7 Bouton tout déselectionner

**Date** : 2026-02-11  
**Livrable** : `tests/bdd/tout-deselectionner.feature`

## Vérifications

- **bddgen** : ✅ Le fichier .feature est parsé correctement. Nouveaux steps à implémenter (attendus — pas de step definitions dans la livraison BDD).
- **Couverture des CA** : ✅ CA1 (2 scénarios), CA2 (2), CA3 (1) — 5 scénarios au total.
- **Conventions** : Feature en français (`# language: fr`), Contexte (accueil), structure alignée avec `etiquettes-admin.feature` et `selection-shift.feature`.
- **Steps réutilisés** : `je suis sur la page d'accueil`, `je suis connecté en tant qu'administrateur/non administrateur`, `la galerie affiche au moins un souvenir`, `je coche la case à cocher d'une carte de la galerie`, `je coche la case à cocher de deux cartes de la galerie`, `le bouton "Ajouter étiquette" n'est pas visible`, `les cartes n'affichent pas de case à cocher`.
- **Périmètre** : Aucun code ni step definition dans la livraison BDD → conforme.

## Verdict

**✅ BDD US-5.7 validés.** Prêt pour l'étape **TDD-front-end** (bouton, steps, intégration dans la zone étiquettes). Pas de TDD-back-end : logique purement UI (décocher toutes les cases).

## Décisions / remarques

- Les steps « le bouton "Tout déselectionner" n'est pas visible », « est visible », « je clique sur le bouton "Tout déselectionner" », « toutes les cartes sont décochées » seront implémentés par TDD-front-end.
