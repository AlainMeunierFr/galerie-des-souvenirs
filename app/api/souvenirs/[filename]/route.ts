import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const MINIATURE_DIR = join(process.cwd(), 'data', 'souvenirs', 'miniature');

function nomFromFilename(filename: string): string {
  return filename.replace(/\.(webp|heic|jpe?g)$/i, '');
}

/**
 * GET /api/souvenirs/[filename] — Sert les miniatures (grille). Bundle léger pour Vercel.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || filename.includes('..')) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  if (!/\.(jpe?g|webp)$/i.test(filename)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  try {
    const buffer = await readFile(join(MINIATURE_DIR, filename));
    const contentType =
      filename.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}

/**
 * DELETE /api/souvenirs/[filename] — Supprime un souvenir (admin uniquement).
 * Import dynamique pour ne pas gonfler le bundle du GET (limite Vercel 300Mo).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { auth, currentUser } = await import('@clerk/nextjs/server');
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

  const { isAdminEmail } = await import('@/utils/isAdmin');
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: 'Réservé à l\'administrateur' }, { status: 403 });
  }

  const { filename } = await params;
  const nom = nomFromFilename(filename);
  if (!nom || nom.includes('..')) {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
  }

  const cwd = process.cwd();
  const { FileSystemSouvenirFileDeleter } = await import('@/utils/adapters/FileSystemSouvenirFileDeleter');
  const { LibsqlSouvenirInventoryRepository } = await import('@/utils/adapters/LibsqlSouvenirInventoryRepository');
  const { deleteSouvenir } = await import('@/utils/use-cases/deleteSouvenir');
  const { db } = await import('@/lib/db');

  const fileDeleter = new FileSystemSouvenirFileDeleter(
    join(cwd, 'data', 'input', 'done'),
    join(cwd, 'data', 'souvenirs', 'webp'),
    join(cwd, 'data', 'souvenirs', 'miniature')
  );
  const inventoryRepo = new LibsqlSouvenirInventoryRepository(db);

  try {
    await deleteSouvenir(nom, inventoryRepo, fileDeleter);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[souvenirs] DELETE error:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
