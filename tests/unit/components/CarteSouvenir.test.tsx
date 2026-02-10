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
});
