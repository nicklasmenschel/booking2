import { NextResponse } from 'next/server';
import { sendThankYouEmails } from '@/jobs/send-thank-you';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await sendThankYouEmails();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Thank you cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
