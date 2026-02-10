'use client';

import type { InteretValeur } from '@/utils';
import { getInteretLabel } from '@/utils/interetLabels';

type CarteSouvenirProps = {
  filename: string;
  interet: InteretValeur;
  onInteretChange: (souvenirNom: string, interet: InteretValeur) => void;
  disabled?: boolean;
};

function souvenirNom(filename: string): string {
  return filename.replace(/\.(webp|heic|jpe?g)$/i, '');
}

export default function CarteSouvenir({
  filename,
  interet,
  onInteretChange,
  disabled = false,
}: CarteSouvenirProps) {
  const nom = souvenirNom(filename);

  return (
    <figure className="galerie-carte">
      {/* eslint-disable-next-line @next/next/no-img-element -- images servies par l’API /api/souvenirs */}
      <img src={`/api/souvenirs/${filename}`} alt="" loading="lazy" />
      <div className="galerie-carte-boutons" role="group" aria-label="Intérêt">
        <button
          type="button"
          onClick={() => onInteretChange(nom, 'oui')}
          disabled={disabled}
          aria-pressed={interet === 'oui'}
          data-testid={`interet-oui-${nom}`}
        >
          {getInteretLabel('intéressé')}
        </button>
        <button
          type="button"
          onClick={() => onInteretChange(nom, 'non')}
          disabled={disabled}
          aria-pressed={interet === 'non'}
          data-testid={`interet-non-${nom}`}
        >
          {getInteretLabel('pas intéressé')}
        </button>
        <button
          type="button"
          onClick={() => onInteretChange(nom, null)}
          disabled={disabled}
          aria-pressed={interet === null}
          data-testid={`interet-null-${nom}`}
        >
          {getInteretLabel('pas prononcé')}
        </button>
      </div>
    </figure>
  );
}
