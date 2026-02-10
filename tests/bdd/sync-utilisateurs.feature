# language: fr
Fonctionnalité: Synchroniser les utilisateurs Clerk vers une table locale (US-3.1)

  Contexte:
    Étant donné je suis sur la page d'accueil

  Scénario: CA1 - La table user existe avec les colonnes attendues
    Étant donné la base de données est initialisée
    Alors la table user existe
    Et la table user contient les colonnes clerk_id, email, created_at

  Scénario: CA2 - Inscription via Clerk crée un enregistrement en base locale
    Étant donné je ne suis pas connecté
    Quand je m'inscris via Clerk avec l'email "nouveau@test.fr"
    Alors un utilisateur avec l'email "nouveau@test.fr" existe dans la base locale

  Scénario: CA3 - Mise à jour du profil Clerk met à jour la base locale
    Étant donné je suis connecté avec l'email "existant@test.fr"
    Quand je modifie mon email en "modifie@test.fr" dans mon profil Clerk
    Alors la base locale contient un utilisateur avec l'email "modifie@test.fr"
