'use client';

import { useState } from 'react';
import type { InteretCle } from '@/utils';
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
  const [selectedKeys, setSelectedKeys] = useState<Set<InteretCle>>(
    () => new Set(TOUTES_LES_CLES)
  );

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
        </div>
      </header>
      <section
        className="galerie"
        data-testid="galerie"
        aria-label="Galerie de photos"
      >
        <GalerieCartes
          souvenirs={souvenirs}
          selectedFilterKeys={selectedKeys}
        />
      </section>
    </main>
  );
}
