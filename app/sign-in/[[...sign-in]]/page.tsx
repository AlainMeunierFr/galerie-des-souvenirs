'use client';

import * as React from 'react';
import { useAuth, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import type { ClerkAPIError } from '@clerk/types';
import Link from 'next/link';

/**
 * Page de connexion personnalisée : intercepte les erreurs Clerk (ex. 422,
 * mot de passe incorrect) et les affiche à l'utilisateur au lieu de les
 * laisser uniquement en console.
 */
export default function SignInPage() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<ClerkAPIError[] | undefined>(undefined);
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(undefined);
    if (!isLoaded || !signIn) return;
    setSubmitting(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            router.push('/');
          },
        });
      } else {
        setErrors([{ code: 'unexpected_status', message: 'Étape de connexion inattendue.', longMessage: 'Étape de connexion inattendue.' } as ClerkAPIError]);
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setErrors(err.errors);
      } else {
        setErrors([{ code: 'unknown', message: 'Une erreur est survenue.', longMessage: 'Une erreur est survenue. Réessayez ou contactez le support.' } as ClerkAPIError]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || isSignedIn) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center p-4">
        <p className="text-muted-foreground">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Connexion</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signin-email" className="block text-sm font-medium mb-1">
              Adresse email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="signin-password" className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {errors && errors.length > 0 && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
            >
              <ul className="list-disc list-inside space-y-1">
                {errors.map((el, index) => (
                  <li key={index}>{el.longMessage ?? el.message}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
            <Link
              href="/"
              className="text-center text-sm text-muted-foreground hover:underline"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
