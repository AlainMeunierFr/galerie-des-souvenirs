# Revue US-5.2 — BDD (filtre par intérêt et header fixe)

**Date** : 2026-02-09

## Vérifications

- **Fichier** : `tests/bdd/filtre-interet-header.feature` créé, `# language: fr` en première ligne → OK.
- **CA1** : Scénario présent (filtre, trois options, mêmes libellés que les boutons) ; vocabulaire par concept (concepts : intéressé, pas intéressé, pas prononcé) → OK.
- **CA2** : Scénario logique OU (décocher "pas prononcé", galerie filtrée) ; options désignées par clé dans les steps → OK.
- **CA3** : Scénario état initial (toutes options cochées, galerie entière) → OK.
- **CA4** : Scénario header fixe (défilement, H1 et filtre restent visibles) → OK.
- **Contrainte US** : Vocabulaire par concept et rappel en en-tête du .feature (step definitions résolvent via source unique) → cohérent avec l’US.
- **Steps réutilisés** : Contexte "je suis sur la page d'accueil" + "je suis connecté" (existants).
- **Périmètre** : Aucun code ni step definition dans la livraison BDD → conforme.

## Verdict

**BDD US-5.2 validés.** Prêt pour TDD-back-end (source unique des libellés dans `utils/`), puis TDD-front-end (filtre, header sticky, steps).
