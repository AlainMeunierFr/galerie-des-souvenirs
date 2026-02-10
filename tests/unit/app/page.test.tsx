import { render, screen } from '@testing-library/react';
import HomePageContent from '@/app/HomePageContent';

jest.mock('@clerk/nextjs', () => ({
  SignedIn: () => null,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
  useUser: () => ({ isSignedIn: false }),
}));

describe('Page d\'accueil - non connecté', () => {
  it('affiche le titre H1 avec le message de bienvenue', () => {
    render(<HomePageContent souvenirs={[]} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Bienvenue sur la galerie des souvenirs');
  });

  it('affiche le H2 d\'invitation à se connecter quand non connecté', () => {
    render(<HomePageContent souvenirs={[]} />);
    const h2 = screen.getByRole('heading', {
      level: 2,
      name: 'Connectez-vous ou créez-vous un compte utilisateur',
    });
    expect(h2).toBeInTheDocument();
  });
});
