import { render, screen, waitFor } from '@testing-library/react';
import HomePageContent from '@/app/HomePageContent';

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  useUser: () => ({ isSignedIn: true }),
}));

describe('Page d\'accueil - connecté', () => {
  it('affiche le titre H1 en haut à gauche', async () => {
    render(<HomePageContent souvenirs={[]} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Bienvenue sur la galerie des souvenirs'
      );
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-left');
  });

  it('affiche la galerie (type .galerie, layout en CSS global)', async () => {
    render(<HomePageContent souvenirs={[]} />);
    await waitFor(() => {
      expect(screen.getByTestId('galerie')).toBeInTheDocument();
    });
    const galerie = screen.getByTestId('galerie');
    expect(galerie).toHaveClass('galerie');
  });
});
