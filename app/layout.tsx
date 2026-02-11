import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import HeaderSignedIn from "./components/HeaderSignedIn";
import WelcomeTitle from "./components/WelcomeTitle";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Galerie des souvenirs",
  description: "Partage des objets souvenir en famille",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <header className="flex justify-between items-center p-4 gap-4 min-h-16 border-b">
              <SignedIn>
                <WelcomeTitle />
              </SignedIn>
              <div className="flex items-center gap-4 ml-auto">
                <SignedOut>
                  <SignInButton mode="redirect" forceRedirectUrl="/sign-in">
                    <button
                      type="button"
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      Connexion
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                    >
                      S&apos;inscrire
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <HeaderSignedIn />
                </SignedIn>
              </div>
            </header>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
