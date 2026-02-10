import { render, screen, waitFor } from '@testing-library/react';
import HomePageContent from '@/app/HomePageContent';

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  useUser: () => ({
    isSignedIn: true,
    user: { primaryEmailAddress: { emailAddress: 'user@test.fr' } },
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
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
      expect(screen.getAllByTestId('galerie').length).toBeGreaterThan(0);
    });
    const galeries = screen.getAllByTestId('galerie');
    expect(galeries.some((g) => g.classList.contains('galerie'))).toBe(true);
  });
});
