'use client';

import { getInteretOptions } from '@/utils/interetLabels';
import type { InteretCle } from '@/utils';

type FiltreInteretProps = {
  selectedKeys: Set<InteretCle>;
  onChange: (selected: Set<InteretCle>) => void;
};

export default function FiltreInteret({
  selectedKeys,
  onChange,
}: FiltreInteretProps) {
  const options = getInteretOptions();

  const handleToggle = (cle: InteretCle) => {
    const next = new Set(selectedKeys);
    if (next.has(cle)) next.delete(cle);
    else next.add(cle);
    onChange(next);
  };

  return (
    <fieldset
      className="filtreInteret"
      data-testid="filtre-interet"
      aria-label="Filtre par intérêt"
    >
      <legend className="filtreInteret-legend">Intérêt</legend>
      <div className="filtreInteret-options" role="group">
        {options.map(({ cle, libelle }) => (
          <label key={cle} className="filtreInteret-option">
            <input
              type="checkbox"
              checked={selectedKeys.has(cle)}
              onChange={() => handleToggle(cle)}
              data-testid={`filtre-interet-${cle.replace(/\s/g, '-')}`}
            />
            <span>{libelle}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
