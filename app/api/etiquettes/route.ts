import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  defaultEtiquetteRepository,
  isAdminEmail,
} from '@/utils';

async function requireAdmin(): Promise<NextResponse | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  let email = '';
  try {
    const clerkUser = await currentUser();
    const primary =
      clerkUser?.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      ) ?? clerkUser?.emailAddresses?.[0];
    email = primary?.emailAddress ?? '';
  } catch {
    // ignore
  }
  if (!isAdminEmail(email)) {
    return NextResponse.json(
      { error: "Réservé à l'administrateur" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * GET /api/etiquettes — Liste toutes les étiquettes (admin).
 */
export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const repo = defaultEtiquetteRepository;
  await repo.ensureTables();

  const list = await repo.listAll();
  return NextResponse.json(list);
}

/**
 * POST /api/etiquettes — Crée une étiquette (admin).
 * Body: { libelle: string, souvenir_noms?: string[] }
 * Si souvenir_noms est fourni, affecte la nouvelle étiquette à ces souvenirs.
 */
export async function POST(req: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const repo = defaultEtiquetteRepository;
  await repo.ensureTables();

  let body: { libelle?: string; souvenir_noms?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps JSON invalide' },
      { status: 400 }
    );
  }

  const { libelle, souvenir_noms } = body;
  if (typeof libelle !== 'string' || !libelle.trim()) {
    return NextResponse.json(
      { error: 'libelle requis et non vide' },
      { status: 400 }
    );
  }

  const noms =
    Array.isArray(souvenir_noms) ?
      souvenir_noms.filter((n): n is string => typeof n === 'string')
    : [];

  try {
    const { id } = await repo.create(libelle.trim());
    if (noms.length > 0) {
      await repo.assign(id, noms);
    }
    return NextResponse.json({ id, libelle: libelle.trim() });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes('existe déjà')) {
      return NextResponse.json(
        { error: 'Une étiquette avec ce libellé existe déjà' },
        { status: 409 }
      );
    }
    console.error('[etiquettes] POST create error:', e);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étiquette" },
      { status: 500 }
    );
  }
}
