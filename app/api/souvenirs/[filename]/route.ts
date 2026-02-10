import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const MINIATURE_DIR = join(process.cwd(), 'data', 'souvenirs', 'miniature');

/**
 * GET /api/souvenirs/[filename] — Sert les miniatures (grille). Bundle léger pour Vercel.
 * Pas de DELETE ici pour éviter Clerk + libsql dans ce bundle (limite 300Mo).
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
