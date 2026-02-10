import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  defaultInteretRepository,
  defaultUserRepository,
  ensureUserTable,
  syncUser,
} from '@/utils';
import { db } from '@/lib/db';

async function ensureUserSynced(clerkId: string): Promise<{ id: number } | null> {
  const user = await defaultUserRepository.findByClerkId(clerkId);
  if (user) return user;
  await defaultUserRepository.ensureTable();
  let email = '';
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const primary =
        clerkUser.emailAddresses?.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        ) ?? clerkUser.emailAddresses?.[0];
      email = primary?.emailAddress ?? '';
    }
  } catch (e) {
    console.warn('[interet] currentUser failed:', e);
  }
  if (!email) {
    email = `${clerkId}@clerk.local`;
  }
  await syncUser(defaultUserRepository, clerkId, email);
  return defaultUserRepository.findByClerkId(clerkId);
}

/**
 * GET /api/interet — Retourne les intérêts de l'utilisateur connecté.
 */
export async function GET() {
  await ensureUserTable(db);
  await defaultInteretRepository.ensureTable();

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const user = await ensureUserSynced(clerkId);
  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur non synchronisé (email manquant)' },
      { status: 404 }
    );
  }

  const map = await defaultInteretRepository.findByUser(user.id);
  const obj = Object.fromEntries(map);
  return NextResponse.json(obj);
}

/**
 * POST /api/interet — Enregistre ou met à jour l'intérêt pour un souvenir.
 * Body: { souvenir_nom: string, interet: 'oui' | 'non' | null }
 */
export async function POST(req: NextRequest) {
  await ensureUserTable(db);
  await defaultInteretRepository.ensureTable();

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const user = await ensureUserSynced(clerkId);
  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur non synchronisé (email manquant)' },
      { status: 404 }
    );
  }

  let body: { souvenir_nom?: string; interet?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps JSON invalide' },
      { status: 400 }
    );
  }

  const { souvenir_nom, interet } = body;
  if (typeof souvenir_nom !== 'string' || !souvenir_nom.trim()) {
    return NextResponse.json(
      { error: 'souvenir_nom requis' },
      { status: 400 }
    );
  }

  const val =
    interet === null || interet === undefined
      ? null
      : interet === 'oui'
        ? 'oui'
        : interet === 'non'
          ? 'non'
          : null;
  if (val === null && interet !== null && interet !== undefined) {
    return NextResponse.json(
      { error: "interet doit être 'oui', 'non' ou null" },
      { status: 400 }
    );
  }

  try {
    await defaultInteretRepository.upsert(user.id, souvenir_nom.trim(), val);
    const verify = await defaultInteretRepository.findByUser(user.id);
    console.log('[interet] POST ok, count:', verify.size, 'user_id:', user.id);
  } catch (err) {
    console.error('[interet] POST upsert error:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
