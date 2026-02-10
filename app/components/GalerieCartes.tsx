'use client';

import { useCallback, useEffect, useState } from 'react';
import type { InteretValeur } from '@/utils';
import CarteSouvenir from './CarteSouvenir';

type GalerieCartesProps = {
  souvenirs: string[];
};

export default function GalerieCartes({ souvenirs }: GalerieCartesProps) {
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

  return (
    <>
      {souvenirs.map((filename) => {
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
