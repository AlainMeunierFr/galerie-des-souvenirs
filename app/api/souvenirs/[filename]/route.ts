import { NextRequest, NextResponse } from 'next/server';
import { getSouvenirBuffer, defaultSouvenirRepository } from '@/utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  try {
    const buffer = await getSouvenirBuffer(defaultSouvenirRepository, filename);
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
