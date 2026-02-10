# Revue US-2.1 — Afficher la galerie

**Date** : 2026-02-10

## Vérifications

- **CA1 (non connecté)** : H1 centré + H2 invitation → OK (`HomePageContent.tsx`, SignedOut).
- **CA2 (connecté)** : H1 en haut à gauche → OK (`text-left mb-4`).
- **CA3 (connecté)** : Galerie 4 colonnes, remplace « Voici les photos » → OK (`section.galerie`, `grid grid-cols-1 md:grid-cols-4`, `data-testid="galerie"`).
- **Tests BDD** : Scénarios `galerie.feature` (CA1, CA2, CA3) exécutés — passés (parmi les 8 passed ; 5 skipped = sync-utilisateurs + scénarios connectés sans env).
- **Steps** : Définitions présentes dans `accueil.steps.ts` (galerie, 4 colonnes).

## Verdict

**US-2.1 validée.** Prête pour Designer (CSS) si besoin, ou clôture.
