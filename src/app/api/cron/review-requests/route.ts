import { NextResponse } from 'next/server';
import { sendReviewRequests } from '@/jobs/send-review-requests';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await sendReviewRequests();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Review request cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
