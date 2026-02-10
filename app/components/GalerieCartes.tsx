'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { InteretValeur } from '@/utils';
import type { InteretCle } from '@/utils';
import CarteSouvenir from './CarteSouvenir';

const CLE_TO_VALEUR: Record<InteretCle, InteretValeur> = {
  'intéressé': 'oui',
  'pas intéressé': 'non',
  'pas prononcé': null,
};

/** 0 = petit (plusieurs cartes par ligne), 100 = grand (1 carte par ligne) */
export type ZoomPercent = number;

const ZOOM_MIN_PX = 140;
const ZOOM_MAX_PX = 600;

type GalerieCartesProps = {
  souvenirs: string[];
  selectedFilterKeys?: Set<InteretCle>;
  zoomPercent?: number;
  isAdmin?: boolean;
};

export default function GalerieCartes({
  souvenirs,
  selectedFilterKeys,
  zoomPercent = 50,
  isAdmin = false,
}: GalerieCartesProps) {
  const [interets, setInterets] = useState<Record<string, InteretValeur>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<{ filter: (pred: (item: unknown) => boolean) => void; refreshItems: () => void; layout: () => void; destroy: () => void } | null>(null);

  const fetchInterets = useCallback(async () => {
    try {
      const res = await fetch('/api/interet');
      if (res.ok) {
        const data = (await res.json()) as Record<string, string | null>;
        const normalized: Record<string, InteretValeur> = {};
        for (const [k, v] of Object.entries(data)) {
          normalized[k] = v === 'oui' ? 'oui' : v === 'non' ? 'non' : null;
        }
        setInterets(normalized);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterets();
  }, [fetchInterets]);

  const handleDelete = useCallback(
    async (nom: string) => {
      setPendingDelete(nom);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    const nom = pendingDelete;
    if (!nom) return;
    setPendingDelete(null);
    setPending((prev) => new Set(prev).add(nom));
    try {
      const filename = souvenirs.find((f) => f.replace(/\.(webp|heic|jpe?g)$/i, '') === nom) ?? `${nom}.webp`;
      const res = await fetch(`/api/souvenirs/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('[souvenirs] DELETE failed:', res.status, err);
      }
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(nom);
        return next;
      });
    }
  }, [pendingDelete, souvenirs, router]);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleInteretChange = useCallback(
    async (souvenirNom: string, interet: InteretValeur) => {
      setPending((prev) => new Set(prev).add(souvenirNom));
      try {
        const res = await fetch('/api/interet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ souvenir_nom: souvenirNom, interet }),
        });
        if (res.ok) {
          setInterets((prev) => ({ ...prev, [souvenirNom]: interet }));
        } else {
          const err = await res.json().catch(() => ({}));
          console.error('[interet] POST failed:', res.status, err);
        }
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(souvenirNom);
          return next;
        });
      }
    },
    []
  );

  const selectedValeurs = useMemo(
    () =>
      selectedFilterKeys
        ? new Set(
            [...selectedFilterKeys].map((cle) => CLE_TO_VALEUR[cle])
          )
        : null,
    [selectedFilterKeys]
  );

  // Muuri: init grid on mount (import dynamique pour éviter "window is not defined" en SSR)
  useEffect(() => {
    const el = gridRef.current;
    if (!el || souvenirs.length === 0) return;
    let cancelled = false;
    import('muuri').then(({ default: Muuri }) => {
      if (cancelled || !gridRef.current) return;
      const grid = new Muuri(gridRef.current, {
        items: '.muuri-item',
        layout: { fillGaps: true },
        layoutOnInit: true,
        layoutDuration: 280,
        showDuration: 200,
        hideDuration: 200,
        itemVisibleClass: 'muuri-item-shown',
        itemHiddenClass: 'muuri-item-hidden',
      });
      if (!cancelled) gridInstanceRef.current = grid;
      else grid.destroy();
    });
    return () => {
      cancelled = true;
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy();
        gridInstanceRef.current = null;
      }
    };
  }, [souvenirs.length]);

  // Muuri: filter when selectedValeurs or interets change
  useEffect(() => {
    const grid = gridInstanceRef.current;
    if (!grid || selectedValeurs === null) return;
    grid.filter((item: unknown) => {
      const el = (item as { getElement(): HTMLElement | null }).getElement();
      const raw = el?.getAttribute('data-interet');
      const interet: InteretValeur = raw === 'null' ? null : (raw as 'oui' | 'non');
      return selectedValeurs.has(interet);
    });
  }, [selectedValeurs, interets]);

  // Muuri: refresh layout when zoom level changes
  useEffect(() => {
    const grid = gridInstanceRef.current;
    if (!grid) return;
    grid.refreshItems();
    grid.layout();
  }, [zoomPercent]);

  const itemSizePx = Math.round(
    ZOOM_MIN_PX + (zoomPercent / 100) * (ZOOM_MAX_PX - ZOOM_MIN_PX)
  );

  return (
    <>
    <div
      ref={gridRef}
      className="galerie-muuri"
      style={{ '--galerie-item-size': `${itemSizePx}px` } as React.CSSProperties}
    >
      {souvenirs.map((filename) => {
        const nom = filename.replace(/\.(webp|heic|jpe?g)$/i, '');
        const interetValue: InteretValeur = interets[nom] ?? null;
        const dataInteret =
          interetValue === null ? 'null' : interetValue;
        return (
          <div
            key={filename}
            className="muuri-item"
            data-interet={dataInteret}
          >
            <div className="muuri-item-content">
              <CarteSouvenir
                filename={filename}
                interet={interetValue}
                onInteretChange={handleInteretChange}
                disabled={loading || pending.has(nom)}
                isAdmin={isAdmin}
                onDelete={isAdmin ? () => handleDelete(nom) : undefined}
              />
            </div>
          </div>
        );
      })}
    </div>
    {pendingDelete && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="modal-confirmation-suppression"
        data-testid="modal-confirmation-suppression"
      >
        <h2 id="confirm-delete-title">Confirmer la suppression ?</h2>
        <p>Le souvenir sera définitivement supprimé.</p>
        <div className="modal-confirmation-actions">
          <button
            type="button"
            onClick={confirmDelete}
            data-testid="modal-confirm-suppression"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={cancelDelete}
            data-testid="modal-annuler-suppression"
          >
            Annuler
          </button>
        </div>
      </div>
    )}
    </>
  );
}
