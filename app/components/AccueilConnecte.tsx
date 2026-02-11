'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { InteretCle } from '@/utils';
import { isAdminEmail } from '@/utils/isAdmin';
import { isEtiquetteAdminOnly } from '@/utils/filterSouvenirsByEtiquettes';
import FiltreInteret from './FiltreInteret';
import FiltreEtiquette from './FiltreEtiquette';
import GalerieCartes from './GalerieCartes';

type AccueilConnecteProps = {
  souvenirs: string[];
};

export default function AccueilConnecte({ souvenirs }: AccueilConnecteProps) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const isAdmin = isAdminEmail(email);
  /** Filtre intérêt : un seul à la fois. Set vide = sans filtre (tout afficher). */
  const [selectedKeys, setSelectedKeys] = useState<Set<InteretCle>>(
    () => new Set()
  );
  const [zoomPercent, setZoomPercent] = useState(50);
  const [etiquettes, setEtiquettes] = useState<{ id: number; libelle: string }[]>([]);
  /** Filtre étiquette : un seul à la fois. Set vide = tout afficher, Set d'un élément = filtrer par cet étiquette. */
  const [selectedEtiquetteLibelles, setSelectedEtiquetteLibelles] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    let cancelled = false;
    fetch('/api/etiquettes')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: number; libelle: string }[]) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setEtiquettes(list);
        }
      })
      .catch(() => {
        if (!cancelled) setEtiquettes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return (
    <main className="p-4">
      <header
        className="page-header-sticky sticky top-0 z-10 bg-background p-4 pb-2"
        data-layout="page-header-sticky"
        data-testid="page-header"
      >
        <div className="page-header-filtres" data-testid="zone-filtres">
          <div className="page-header-filtre-item">
            <FiltreInteret selectedKeys={selectedKeys} onChange={setSelectedKeys} />
          </div>
          <div className="page-header-filtre-item">
            <FiltreEtiquette
              etiquettes={
                isAdmin
                  ? etiquettes
                  : etiquettes.filter((e) => !isEtiquetteAdminOnly(e.libelle))
              }
              selectedLibelles={selectedEtiquetteLibelles}
              onChange={setSelectedEtiquetteLibelles}
            />
          </div>
          <div id="zone-etiquettes-anchor" className="page-header-filtre-item zone-etiquettes-anchor" />
          <div className="page-header-filtre-item">
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
          selectedEtiquetteLibelles={selectedEtiquetteLibelles}
          zoomPercent={zoomPercent}
          isAdmin={isAdmin}
        />
      </section>
    </main>
  );
}
