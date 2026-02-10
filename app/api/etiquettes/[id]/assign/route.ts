import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { defaultEtiquetteRepository, isAdminEmail } from '@/utils';

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
 * POST /api/etiquettes/[id]/assign — Affecte l'étiquette aux souvenirs (admin).
 * Body: { souvenir_noms: string[] }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id: idParam } = await params;
  const etiquetteId = parseInt(idParam, 10);
  if (Number.isNaN(etiquetteId) || etiquetteId < 1) {
    return NextResponse.json({ error: 'id invalide' }, { status: 400 });
  }

  let body: { souvenir_noms?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps JSON invalide' },
      { status: 400 }
    );
  }

  const souvenir_noms = Array.isArray(body?.souvenir_noms)
    ? body.souvenir_noms.filter((n): n is string => typeof n === 'string')
    : [];

  const repo = defaultEtiquetteRepository;
  await repo.ensureTables();

  try {
    await repo.assign(etiquetteId, souvenir_noms);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[etiquettes] assign error:', e);
    return NextResponse.json(
      { error: 'Erreur lors de l\'affectation' },
      { status: 500 }
    );
  }
}
