'use client';

import { useRef } from 'react';
import type { InteretValeur } from '@/utils';
import { getInteretLabel } from '@/utils/interetLabels';

const ICON_SIZE = 20;

const IconCoeur = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const IconCoeurBarre = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4.9 4.9C2.5 7.3 2.5 11 5 13.5l7 7 7-7c2.5-2.5 2.5-6.2 0-8.6-2.5-2.5-6.2-2.5-8.6 0L12 8.4 9.5 5.9c-1.2-1.2-2.8-1.8-4.4-1.8-1.6 0-3.2.6-4.4 1.8z" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const IconQuestion = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r=".5" fill="currentColor" />
  </svg>
);

type CarteSouvenirProps = {
  filename: string;
  interet: InteretValeur;
  onInteretChange: (souvenirNom: string, interet: InteretValeur) => void;
  disabled?: boolean;
  isAdmin?: boolean;
  onDelete?: (souvenirNom: string) => void;
  /** Sélection pour étiquettes (admin) : coché = inclus dans la sélection. shiftKey = true si Shift était enfoncé au clic (plage). */
  selected?: boolean;
  onSelectionChange?: (souvenirNom: string, selected: boolean, shiftKey?: boolean) => void;
  /** Étiquettes affectées à ce souvenir (affichage) */
  etiquettesSurCarte?: string[];
};

function souvenirNom(filename: string): string {
  return filename.replace(/\.(webp|heic|jpe?g)$/i, '');
}

export default function CarteSouvenir({
  filename,
  interet,
  onInteretChange,
  disabled = false,
  isAdmin = false,
  onDelete,
  selected = false,
  onSelectionChange,
  etiquettesSurCarte = [],
}: CarteSouvenirProps) {
  const nom = souvenirNom(filename);
  const lastShiftKeyRef = useRef(false);

  return (
    <figure className="galerie-carte">
      <div className="galerie-carte-image-wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element -- images servies par l'API /api/souvenirs */}
        <img src={`/api/souvenirs/${filename}`} alt="" loading="lazy" />
        {isAdmin && (
          <div className="galerie-carte-etiquette-checkbox" aria-hidden="false">
            <input
              type="checkbox"
              checked={selected}
              onMouseDown={(e) => {
                lastShiftKeyRef.current = e.shiftKey;
              }}
              onChange={() => onSelectionChange?.(nom, !selected, lastShiftKeyRef.current)}
              aria-label={`Sélectionner ${nom} pour les étiquettes`}
              data-testid={`etiquette-checkbox-${nom}`}
            />
          </div>
        )}
      </div>
      {isAdmin && onDelete ? (
        <div className="galerie-carte-boutons" role="group" aria-label="Actions admin">
          <button
            type="button"
            onClick={() => onDelete(nom)}
            disabled={disabled}
            data-testid={`supprimer-${nom}`}
          >
            Supprimer
          </button>
        </div>
      ) : (
        <div className="galerie-carte-boutons" role="group" aria-label="Intérêt">
          <button
            type="button"
            onClick={() => onInteretChange(nom, null)}
            disabled={disabled}
            aria-pressed={interet === null}
            aria-label={getInteretLabel('pas prononcé')}
            title={getInteretLabel('pas prononcé')}
            data-testid={`interet-null-${nom}`}
          >
            <span className="galerie-carte-bouton-icon" aria-hidden="true">
              <IconQuestion />
            </span>
            <span className="galerie-carte-bouton-text">{getInteretLabel('pas prononcé')}</span>
          </button>
          <button
            type="button"
            onClick={() => onInteretChange(nom, 'oui')}
            disabled={disabled}
            aria-pressed={interet === 'oui'}
            aria-label={getInteretLabel('intéressé')}
            title={getInteretLabel('intéressé')}
            data-testid={`interet-oui-${nom}`}
          >
            <span className="galerie-carte-bouton-icon" aria-hidden="true">
              <IconCoeur />
            </span>
            <span className="galerie-carte-bouton-text">{getInteretLabel('intéressé')}</span>
          </button>
          <button
            type="button"
            onClick={() => onInteretChange(nom, 'non')}
            disabled={disabled}
            aria-pressed={interet === 'non'}
            aria-label={getInteretLabel('pas intéressé')}
            title={getInteretLabel('pas intéressé')}
            data-testid={`interet-non-${nom}`}
          >
            <span className="galerie-carte-bouton-icon" aria-hidden="true">
              <IconCoeurBarre />
            </span>
            <span className="galerie-carte-bouton-text">{getInteretLabel('pas intéressé')}</span>
          </button>
        </div>
      )}
      {etiquettesSurCarte.length > 0 && (
        <div className="galerie-carte-etiquettes" aria-label="Étiquettes du souvenir">
          {etiquettesSurCarte.map((lib) => (
            <span key={lib}>{lib}</span>
          ))}
        </div>
      )}
    </figure>
  );
}
