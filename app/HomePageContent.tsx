import { SignedIn, SignedOut } from '@clerk/nextjs';
import AccueilConnecte from './components/AccueilConnecte';

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
        <AccueilConnecte souvenirs={souvenirs} />
      </SignedIn>
    </>
  );
}
