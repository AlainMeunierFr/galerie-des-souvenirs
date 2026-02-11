# Revue BDD — US-5.6 Filtre par étiquette

**Date** : 2026-02-11  
**Livrable** : `tests/bdd/filtre-etiquette.feature`

## Vérifications

- **bddgen** : ✅ Le fichier .feature est parsé correctement. 18 steps à implémenter (attendus — pas de step definitions dans la livraison BDD).
- **Couverture des CA** : ✅ CA1 (2 scénarios), CA2 (3), CA3 (1), CA4 (1) — 7 scénarios au total.
- **Conventions** : Feature en français (`# language: fr`), Contexte (accueil + connecté), structure alignée avec `filtre-interet-header.feature`.
- **Steps réutilisés** : `je suis sur la page d'accueil`, `je suis connecté`, `la galerie affiche au moins un souvenir`, `la galerie affiche l'ensemble des souvenirs`, `je fais défiler le contenu de la page vers le bas`.
- **Périmètre** : Aucun code ni step definition dans la livraison BDD → conforme.

## Décisions / remarques

- Les `Given` d'état préparé (`l'étiquette X existe en base`, `au moins un souvenir a l'étiquette X`, etc.) sont des no-ops en E2E tant que le TDD n'a pas fourni de fixtures ou d'API de test. Les step definitions pourront s'appuyer sur des données de test ou un ordre d'exécution spécifique.
- Attention Muuri : la note dans l'US-5.6 rappelle que le remplacement de Muuri peut impacter la structure DOM des filtres — vérifier la cohérence lors du TDD-front-end.

## Verdict

**✅ BDD US-5.6 validés.** Prêt pour l'étape TDD-back-end (utilitaire(s) de filtrage par étiquettes si nécessaire), puis TDD-front-end (contrôle, steps, intégration header).
