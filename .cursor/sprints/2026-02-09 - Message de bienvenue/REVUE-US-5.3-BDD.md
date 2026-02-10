# Revue US-5.3 — BDD (Privilèges administrateur)

**Date** : 2026-02-09

## Contexte

Revue de la livraison **agent BDD** : fichier `tests/bdd/admin-privileges.feature` pour l’US-5.3 (identification admin alain@maep.fr, cartes admin sans boutons d’intérêt + bouton Supprimer, pop-up de confirmation, suppression base + dossiers).

## Vérifications

- **Fichier** : `tests/bdd/admin-privileges.feature` créé, `# language: fr` en première ligne, Contexte commun « je suis sur la page d'accueil » → OK.
- **CA1** : Deux scénarios (admin reconnu / non admin non reconnu) avec steps « je suis connecté en tant qu'administrateur » et « en tant qu'utilisateur non administrateur », Then observable (« me considère » / « ne me considère pas ») → couvert.
- **CA2** : Deux scénarios (admin : pas de 3 boutons, bouton Supprimer ; non-admin : 3 boutons, pas de Supprimer) → comportement observable, testable.
- **CA3** : Trois scénarios (pop-up à l’ouverture ; confirmation → suppression base + Done/Webp/miniatures ; annulation → pas de suppression, fichiers restent) → flux complet couvert.
- **CA4** : Implicite dans les steps (identification par session/email) ; pas de scénario dédié nécessaire.
- **Steps listés** : Given/When/Then listés en fin de livraison BDD pour les step definitions → OK.
- **Périmètre** : Aucun code ni step definition dans la livraison BDD → conforme.

## Verdict

**BDD US-5.3 validés.** Prêt pour **TDD-back-end** (détection admin, API suppression souvenir, suppression en base et dans les dossiers Done / Webp / miniatures), puis TDD-front-end (UI admin, bouton Supprimer, pop-up, step definitions).

**Prochaine action** : au prochain GO NEXT, passage à l’agent TDD-back-end (après validation éventuelle des baby steps avec l’utilisateur).
