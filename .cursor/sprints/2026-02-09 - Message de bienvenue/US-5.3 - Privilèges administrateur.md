#### US-5.3 : Privilèges administrateur

**Statut** : validée (revue Lead Dev 2026-02-09)

**En tant que** utilisateur dont le login (email) est **alain@maep.fr**

**Je souhaite** être reconnu comme administrateur et avoir accès à des fonctions réservées à l’admin lorsque je suis connecté

**Afin de** gérer ou superviser la galerie et les paramètres au-delà du simple usage visiteur.

---

**Critères d'acceptation**

- **CA1 - Identification de l’administrateur** :
  - L’utilisateur connecté dont l’adresse email (Clerk / session) est **alain@maep.fr** est considéré comme administrateur.
  - Tout autre utilisateur connecté n’est pas considéré comme administrateur.

- **CA2 - Cartes souvenirs pour l’administrateur** :
  - L’administrateur **ne précise pas son intérêt** pour les souvenirs : les **3 boutons d’intérêt** (Intéressé, Pas intéressé, Pas prononcé) **n’apparaissent pas** sur les cartes pour lui.
  - À la place, un **bouton « Supprimer »** est proposé sur chaque carte (visible uniquement pour l’admin).

- **CA3 - Suppression d’un souvenir (flux)** :
  - Lorsque l’administrateur clique sur le bouton « Supprimer » d’une carte, une **pop-up** (ou dialogue modal) l’invite à **confirmer** son choix.
  - S’il confirme :
    - L’image (le souvenir) est **supprimée de la base de données**.
    - Les fichiers associés sont supprimés des dossiers **Done**, **Webp** et **miniatures** (selon la structure existante du projet).
  - S’il annule ou ferme sans confirmer, aucune suppression n’est effectuée.

- **CA4 - Comportement sans ambiguïté** :
  - Le fait d’être admin ou non est déterminé uniquement par l’email de la session (alain@maep.fr = admin). Aucun autre mécanisme (rôle en base, flag, etc.) n’est exigé dans cette US ; des évolutions (table des admins, rôles) pourront faire l’objet d’une US ultérieure.
