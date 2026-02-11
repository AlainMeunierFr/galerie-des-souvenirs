'use client';

import { SANS_ETIQUETTE } from '@/utils/filterSouvenirsByEtiquettes';

const SANS_FILTRE = '';

type FiltreEtiquetteProps = {
  etiquettes: { id: number; libelle: string }[];
  selectedLibelles: Set<string>;
  onChange: (selected: Set<string>) => void;
};

export default function FiltreEtiquette({
  etiquettes,
  selectedLibelles,
  onChange,
}: FiltreEtiquetteProps) {
  const options = [
    ...etiquettes.map((e) => e.libelle),
    SANS_ETIQUETTE,
  ];
  const value =
    selectedLibelles.size === 0 ? SANS_FILTRE : ([...selectedLibelles][0] as string);

  const handleSelect = (v: string) => {
    if (v === SANS_FILTRE) {
      onChange(new Set());
      return;
    }
    onChange(new Set([v]));
  };

  return (
    <div className="filtre-pills" data-testid="filtre-etiquette">
      <span className="filtre-pills-legend">Étiquette</span>
      <div className="filtre-pills-options" role="group" aria-label="Filtre par étiquette">
        <button
          type="button"
          className={`filtre-pills-option ${value === SANS_FILTRE ? 'filtre-pills-option--selected' : ''}`}
          onClick={() => handleSelect(SANS_FILTRE)}
          aria-pressed={value === SANS_FILTRE}
          data-testid="filtre-etiquette-sans-filtre"
        >
          Sans filtre
        </button>
        {options.map((libelle) => (
          <button
            key={libelle}
            type="button"
            className={`filtre-pills-option ${value === libelle ? 'filtre-pills-option--selected' : ''}`}
            onClick={() => handleSelect(libelle)}
            aria-pressed={value === libelle}
            data-testid={`filtre-etiquette-${libelle.replace(/\s/g, '-')}`}
          >
            {libelle}
          </button>
        ))}
      </div>
    </div>
  );
}
