'use client';

import { getInteretOptions } from '@/utils/interetLabels';
import type { InteretCle } from '@/utils';

const SANS_FILTRE = '';

type FiltreInteretProps = {
  selectedKeys: Set<InteretCle>;
  onChange: (selected: Set<InteretCle>) => void;
};

export default function FiltreInteret({
  selectedKeys,
  onChange,
}: FiltreInteretProps) {
  const options = getInteretOptions();
  const value =
    selectedKeys.size === 0 ? SANS_FILTRE : ([...selectedKeys][0] as string);

  const handleSelect = (v: string) => {
    if (v === SANS_FILTRE) {
      onChange(new Set());
      return;
    }
    onChange(new Set([v as InteretCle]));
  };

  return (
    <div className="filtre-pills" data-testid="filtre-interet">
      <span className="filtre-pills-legend">Intérêt</span>
      <div className="filtre-pills-options" role="group" aria-label="Filtre par intérêt">
        <button
          type="button"
          className={`filtre-pills-option ${value === SANS_FILTRE ? 'filtre-pills-option--selected' : ''}`}
          onClick={() => handleSelect(SANS_FILTRE)}
          aria-pressed={value === SANS_FILTRE}
          data-testid="filtre-interet-sans-filtre"
        >
          Sans filtre
        </button>
        {options.map(({ cle, libelle }) => (
          <button
            key={cle}
            type="button"
            className={`filtre-pills-option ${value === cle ? 'filtre-pills-option--selected' : ''}`}
            onClick={() => handleSelect(cle)}
            aria-pressed={value === cle}
            data-testid={`filtre-interet-${cle.replace(/\s/g, '-')}`}
          >
            {libelle}
          </button>
        ))}
      </div>
    </div>
  );
}
