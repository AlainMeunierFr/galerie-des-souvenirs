import { render, screen } from '@testing-library/react';
import CarteSouvenir from '@/app/components/CarteSouvenir';
import { getInteretLabel } from '@/utils/interetLabels';

describe('CarteSouvenir', () => {
  it('affiche les libellés des boutons depuis la source unique (getInteretLabel)', () => {
    const onInteretChange = jest.fn();
    render(
      <CarteSouvenir
        filename="IMG_001.webp"
        interet={null}
        onInteretChange={onInteretChange}
      />
    );
    expect(
      screen.getByRole('button', { name: getInteretLabel('intéressé') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: getInteretLabel('pas intéressé') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: getInteretLabel('pas prononcé') })
    ).toBeInTheDocument();
  });

  it('affiche le bouton Supprimer quand isAdmin est true', () => {
    const onDelete = jest.fn();
    render(
      <CarteSouvenir
        filename="IMG_001.webp"
        interet={null}
        onInteretChange={jest.fn()}
        isAdmin
        onDelete={onDelete}
      />
    );
    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: getInteretLabel('intéressé') })).not.toBeInTheDocument();
  });

  it('affiche les 3 boutons d\'intérêt quand isAdmin est false', () => {
    render(
      <CarteSouvenir
        filename="IMG_001.webp"
        interet={null}
        onInteretChange={jest.fn()}
        isAdmin={false}
      />
    );
    expect(screen.getByRole('button', { name: getInteretLabel('intéressé') })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument();
  });
});
