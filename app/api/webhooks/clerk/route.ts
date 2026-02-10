import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';
import { ensureUserTable } from '@/utils/db';
import { syncUser, defaultUserRepository } from '@/utils';
import { db } from '@/lib/db';

function getPrimaryEmail(data: { email_addresses?: Array<{ id: string; email_address: string }>; primary_email_address_id?: string | null }): string {
  const emails = data.email_addresses ?? [];
  const primaryId = data.primary_email_address_id;
  const primary = primaryId
    ? emails.find((e) => e.id === primaryId)
    : emails[0];
  return primary?.email_address ?? '';
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    await ensureUserTable(db);

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const email = getPrimaryEmail(evt.data as Parameters<typeof getPrimaryEmail>[0]);
      if (evt.data.id && email) {
        await syncUser(defaultUserRepository, evt.data.id, email);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook Clerk error:', err);
    return new NextResponse('Error', { status: 400 });
  }
}
