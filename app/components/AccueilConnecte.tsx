'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { InteretCle } from '@/utils';
import { isAdminEmail } from '@/utils/isAdmin';
import { getInteretOptions } from '@/utils/interetLabels';
import FiltreInteret from './FiltreInteret';
import GalerieCartes from './GalerieCartes';

type AccueilConnecteProps = {
  souvenirs: string[];
};

const TOUTES_LES_CLES: Set<InteretCle> = new Set(
  getInteretOptions().map((o) => o.cle)
);

export default function AccueilConnecte({ souvenirs }: AccueilConnecteProps) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const isAdmin = isAdminEmail(email);
  const [selectedKeys, setSelectedKeys] = useState<Set<InteretCle>>(
    () => new Set(TOUTES_LES_CLES)
  );
  const [zoomPercent, setZoomPercent] = useState(50);

  return (
    <main className="p-4">
      <header
        className="page-header-sticky sticky top-0 z-10 bg-background p-4 pb-2"
        data-layout="page-header-sticky"
        data-testid="page-header"
      >
        <h1 className="text-left mb-4">
          Bienvenue sur la galerie des souvenirs
        </h1>
        <div className="page-header-filtres" data-testid="zone-filtres">
          <FiltreInteret selectedKeys={selectedKeys} onChange={setSelectedKeys} />
          <div className="galerie-zoom" role="group" aria-label="Taille des cartes">
            <span className="galerie-zoom-label" id="zoom-label">
              Petit
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={zoomPercent}
              onChange={(e) => setZoomPercent(Number(e.target.value))}
              aria-labelledby="zoom-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={zoomPercent}
              aria-valuetext={
                zoomPercent < 25
                  ? 'Petit'
                  : zoomPercent < 75
                    ? 'Moyen'
                    : 'Grand'
              }
            />
            <span className="galerie-zoom-label" aria-live="polite">
              Grand
            </span>
          </div>
        </div>
      </header>
      <section
        className="galerie grid-cols-4"
        data-testid="galerie"
        aria-label="Galerie de photos"
      >
        <GalerieCartes
          souvenirs={souvenirs}
          selectedFilterKeys={selectedKeys}
          zoomPercent={zoomPercent}
          isAdmin={isAdmin}
        />
      </section>
    </main>
  );
}
