@Designer

Tu es l'agent Designer. US en cours : **US-5.3 — Privilèges administrateur** (voir `.cursor/sprints/US en cours.md` et `.cursor/sprints/2026-02-09 - Message de bienvenue/US-5.3 - Privilèges administrateur.md`).

**Contexte** : Le TDD-front-end a livré le DOM pour :
- **Modal de confirmation de suppression** : `role="dialog"`, `data-testid="modal-confirmation-suppression"`, classes `modal-confirmation-suppression`, `modal-confirmation-actions`, boutons Confirmer / Annuler.
- **Bouton Supprimer** : sur les cartes en mode admin, dans `.galerie-carte-boutons` avec `aria-label="Actions admin"`.

**À faire** :
- Appliquer le CSS pour le modal (overlay, centrage, boutons).
- Appliquer le CSS pour le bouton Supprimer (cohérence avec les boutons d'intérêt existants ou style distinct pour l'action destructive).
- Utiliser les tokens existants (globals.css) ; rester responsive et accessible.

**Périmètre** : Uniquement les fichiers CSS. Ne pas modifier les composants React.

**Rappel** : En fin de livraison, indiquer : *Merci de dire **GO NEXT** pour que le Lead Dev fasse la revue et clôture l'US.*
