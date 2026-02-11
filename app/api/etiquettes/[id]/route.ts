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
 * DELETE /api/etiquettes/[id] — Supprime une étiquette (admin).
 * Les affectations souvenir_etiquette sont supprimées automatiquement (CASCADE).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id: idParam } = await params;
  const etiquetteId = parseInt(idParam, 10);
  if (Number.isNaN(etiquetteId) || etiquetteId < 1) {
    return NextResponse.json({ error: 'id invalide' }, { status: 400 });
  }

  const repo = defaultEtiquetteRepository;
  await repo.ensureTables();

  try {
    await repo.delete(etiquetteId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[etiquettes] DELETE error:', e);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'étiquette" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/etiquettes/[id] — Renomme une étiquette (admin).
 * Body: { libelle: string }
 */
export async function PATCH(
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

  let body: { libelle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps JSON invalide' },
      { status: 400 }
    );
  }

  const libelle = typeof body?.libelle === 'string' ? body.libelle.trim() : '';
  if (!libelle) {
    return NextResponse.json(
      { error: 'libelle requis' },
      { status: 400 }
    );
  }

  const repo = defaultEtiquetteRepository;
  await repo.ensureTables();

  try {
    await repo.update(etiquetteId, libelle);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message.includes('existe déjà')) {
      return NextResponse.json(
        { error: e.message },
        { status: 409 }
      );
    }
    console.error('[etiquettes] PATCH update error:', e);
    return NextResponse.json(
      { error: "Erreur lors du renommage de l'étiquette" },
      { status: 500 }
    );
  }
}
