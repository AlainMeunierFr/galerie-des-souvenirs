import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';
import { syncUser, defaultUserRepository } from '@/utils';

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

    await defaultUserRepository.ensureTable();

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const data = evt.data as Parameters<typeof getPrimaryEmail>[0];
      const email = getPrimaryEmail(data);
      const id = evt.data.id;
      console.log('[Webhook Clerk] payload:', evt.type, {
        id,
        email,
        primary_email_address_id: data.primary_email_address_id,
        email_addresses: data.email_addresses?.map((e) => ({ id: e.id, email_address: e.email_address })),
        willSync: !!(id && email),
      });
      if (id && email) {
        await syncUser(defaultUserRepository, evt.data.id, email);
        console.log('[Webhook Clerk] syncUser done for', email);
      } else {
        console.log('[Webhook Clerk] skip sync: id or email missing');
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook Clerk error:', err);
    return new NextResponse('Error', { status: 400 });
  }
}
