import { render, screen } from '@testing-library/react';
import { HomePageContent } from '@/app/page';

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  useUser: () => ({ isSignedIn: true }),
}));

describe('Page d\'accueil - connecté', () => {
  it('affiche le titre H1 en haut à gauche', () => {
    render(<HomePageContent souvenirs={[]} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Bienvenue sur la galerie des souvenirs');
    expect(h1).toHaveClass('text-left');
  });

  it('affiche la galerie (type .galerie, layout en CSS global)', () => {
    render(<HomePageContent souvenirs={[]} />);
    const galerie = screen.getByTestId('galerie');
    expect(galerie).toBeInTheDocument();
    expect(galerie).toHaveClass('galerie');
  });
});
