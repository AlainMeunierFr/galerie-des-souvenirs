'use client';

import { useUser } from '@clerk/nextjs';

export default function WelcomeTitle() {
  const { user } = useUser();
  const prenom =
    user?.firstName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ??
    '';
  const texte =
    prenom.trim() !== ''
      ? `${prenom}, bienvenue sur la galerie des souvenirs`
      : 'Bienvenue sur la galerie des souvenirs';

  return (
    <h1 className="text-lg font-medium truncate max-w-[60%]" aria-label={texte}>
      {texte}
    </h1>
  );
}
