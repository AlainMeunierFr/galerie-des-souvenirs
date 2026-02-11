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
  it('affiche la zone de filtres (titre H1 avec prénom dans le layout)', async () => {
    render(<HomePageContent souvenirs={[]} />);
    await waitFor(() => {
      expect(screen.getByTestId('zone-filtres')).toBeInTheDocument();
    });
    // Le titre H1 "[prénom], bienvenue sur la galerie des souvenirs" est dans le layout (header Clerk)
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
