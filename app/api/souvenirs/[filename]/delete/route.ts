import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { join } from 'path';
import { isAdminEmail } from '@/utils/isAdmin';
import { deleteSouvenir } from '@/utils/use-cases/deleteSouvenir';
import { FileSystemSouvenirFileDeleter } from '@/utils/adapters/FileSystemSouvenirFileDeleter';
import { LibsqlSouvenirInventoryRepository } from '@/utils/adapters/LibsqlSouvenirInventoryRepository';
import { db } from '@/lib/db';

function nomFromFilename(filename: string): string {
  return filename.replace(/\.(webp|heic|jpe?g)$/i, '');
}

/**
 * DELETE /api/souvenirs/[filename]/delete — Supprime un souvenir (admin uniquement).
 * Route séparée du GET pour éviter de gonfler le bundle des images (limite Vercel 300Mo).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
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
    return NextResponse.json({ error: 'Réservé à l\'administrateur' }, { status: 403 });
  }

  const { filename } = await params;
  const nom = nomFromFilename(filename);
  if (!nom || nom.includes('..')) {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
  }

  const cwd = process.cwd();
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
