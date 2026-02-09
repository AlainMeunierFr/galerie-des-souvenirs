import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Page d\'accueil', () => {
  it('affiche le titre H1 avec le message de bienvenue', () => {
    render(<Home />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Bienvenue sur la galerie des souvenirs');
  });
});
