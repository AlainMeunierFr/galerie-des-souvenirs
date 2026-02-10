'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import type { InteretValeur } from '@/utils';
import type { InteretCle } from '@/utils';
import CarteSouvenir from './CarteSouvenir';

const CLE_TO_VALEUR: Record<InteretCle, InteretValeur> = {
  'intéressé': 'oui',
  'pas intéressé': 'non',
  'pas prononcé': null,
};

type GalerieCartesProps = {
  souvenirs: string[];
  selectedFilterKeys?: Set<InteretCle>;
};

export default function GalerieCartes({
  souvenirs,
  selectedFilterKeys,
}: GalerieCartesProps) {
  const [interets, setInterets] = useState<Record<string, InteretValeur>>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());

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

  const displayedSouvenirs = useMemo(() => {
    if (!selectedValeurs) return souvenirs;
    return souvenirs.filter((filename) => {
      const nom = filename.replace(/\.(webp|heic|jpe?g)$/i, '');
      const v: InteretValeur = interets[nom] ?? null;
      return selectedValeurs.has(v);
    });
  }, [souvenirs, interets, selectedValeurs]);

  return (
    <>
      {displayedSouvenirs.map((filename) => {
        const nom = filename.replace(/\.(webp|heic|jpe?g)$/i, '');
        return (
          <CarteSouvenir
            key={filename}
            filename={filename}
            interet={interets[nom] ?? null}
            onInteretChange={handleInteretChange}
            disabled={loading || pending.has(nom)}
          />
        );
      })}
    </>
  );
}
