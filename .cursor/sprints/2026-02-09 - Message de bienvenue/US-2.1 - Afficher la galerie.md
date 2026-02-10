#### US-2.1 : Afficher la galerie

**Statut** : validée

**En tant que** utilisateur connecté

**Je souhaite** voir une galerie de photos sur la page d'accueil

**Afin de** parcourir les objets souvenir disponibles.

- **Critères d'acceptation** :
- **CA1 - Page non connectée (inchangée)** :
  - La page affiche le titre H1 centré et le message « Connectez-vous ou créez-vous un compte utilisateur » (comportement actuel).
- **CA2 - Page connectée : mise en page** :
  - Le titre H1 « Bienvenue sur la galerie des souvenirs » est en haut à gauche, au-dessus de la barre horizontale Clerk.
  - Le H1 n'est plus centré verticalement.
- **CA3 - Page connectée : galerie** :
  - Le texte « Voici les photos » est remplacé par une galerie de photos.
  - La galerie est affichée sur 4 colonnes (ou équivalent selon le layout).
- **CA4 - Réglage de la taille des cartes (zoom)** :
  - L'utilisateur connecté peut régler la taille d'affichage des cartes (ex. curseur Petit ↔ Grand) ; à « petit », plusieurs cartes par ligne ; à « grand », une carte par ligne ou moins de cartes par ligne.
- **Note implémentation** : La grille peut utiliser un layout dynamique (ex. Muuri) pour le filtrage et le redimensionnement ; les CA ci-dessus décrivent le comportement attendu, pas la techno.
