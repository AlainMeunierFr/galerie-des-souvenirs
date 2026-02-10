'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { Menu } from '@mantine/core';
import { useEffect, useState } from 'react';

/**
 * Header quand l'utilisateur est connecté.
 * Déconnexion via signOut() + window.location.href pour forcer un rechargement
 * complet de la page, afin d'éviter qu'une tentative de connexion échouée (ex. 422)
 * réaffiche l'ancien compte.
 * Le Menu Mantine n'est rendu qu'après hydratation pour éviter l'erreur d'ID (SSR).
 */
export default function HeaderSignedIn() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const imageUrl = user?.imageUrl ?? '';
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? '';

  const avatarButton = (
    <button
      type="button"
      className="rounded-full overflow-hidden border-2 border-transparent hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/40"
      aria-label="Menu compte"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar Clerk, URL externe
        <img
          src={imageUrl}
          alt=""
          width={32}
          height={32}
          className="rounded-full h-8 w-8 object-cover"
        />
      ) : (
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-sm font-medium text-foreground"
          aria-hidden
        >
          {primaryEmail?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
      )}
    </button>
  );

  if (!mounted) {
    return <div className="flex items-center gap-2">{avatarButton}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          {avatarButton}
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            component="button"
            type="button"
            onClick={handleSignOut}
            data-testid="header-deconnexion"
          >
            Déconnexion
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
