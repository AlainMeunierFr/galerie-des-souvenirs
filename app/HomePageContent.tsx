import { SignedIn, SignedOut } from '@clerk/nextjs';
import GalerieCartes from './components/GalerieCartes';

type HomePageContentProps = {
  souvenirs: string[];
};

export default function HomePageContent({ souvenirs }: HomePageContentProps) {
  return (
    <>
      <SignedOut>
        <div className="bienvenue min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1>Bienvenue sur la galerie des souvenirs</h1>
            <br />
            <br />
            <br />
            <h2>Connectez-vous ou créez-vous un compte utilisateur</h2>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <main className="p-4">
          <h1 className="text-left mb-4">Bienvenue sur la galerie des souvenirs</h1>
          <section
            className="galerie"
            data-testid="galerie"
            aria-label="Galerie de photos"
          >
            <GalerieCartes souvenirs={souvenirs} />
          </section>
        </main>
      </SignedIn>
    </>
  );
}
