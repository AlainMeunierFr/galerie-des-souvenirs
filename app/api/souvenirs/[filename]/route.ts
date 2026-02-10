import { NextRequest, NextResponse } from 'next/server';
import { VercelBlobSouvenirRepository } from '@/utils/adapters/VercelBlobSouvenirRepository';
import { getSouvenirBuffer } from '@/utils/use-cases/getSouvenirBuffer';

const repo = new VercelBlobSouvenirRepository();

/**
 * GET /api/souvenirs/[filename] — Sert les miniatures depuis Vercel Blob.
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
    const buffer = await getSouvenirBuffer(repo, filename);
    const contentType =
      filename.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid filename') {
      return new NextResponse('Bad Request', { status: 400 });
    }
    return new NextResponse('Not Found', { status: 404 });
  }
}
