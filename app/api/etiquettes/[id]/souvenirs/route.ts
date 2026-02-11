import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { defaultEtiquetteRepository } from '@/utils';

/**
 * GET /api/etiquettes/[id]/souvenirs?noms=nom1,nom2 — Pour une étiquette et une liste de noms,
 * retourne les noms de souvenirs qui ont déjà cette étiquette (filtre US-5.6 ou panachage admin).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id: idParam } = await params;
  const etiquetteId = parseInt(idParam, 10);
  if (Number.isNaN(etiquetteId) || etiquetteId < 1) {
    return NextResponse.json({ error: 'id invalide' }, { status: 400 });
  }

  const url = new URL(req.url);
  const nomsParam = url.searchParams.get('noms');
  const souvenirNoms =
    nomsParam ?
      nomsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const repo = defaultEtiquetteRepository;
  await repo.ensureTables();

  try {
    const souvenir_noms = await repo.getSouvenirNomsWithEtiquette(
      etiquetteId,
      souvenirNoms
    );
    return NextResponse.json({ souvenir_noms });
  } catch (e) {
    console.error('[etiquettes] getSouvenirNomsWithEtiquette error:', e);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture' },
      { status: 500 }
    );
  }
}
