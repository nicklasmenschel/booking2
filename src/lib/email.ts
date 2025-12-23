import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

interface EmailParams {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
        return { success: true, mock: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from || 'Garden Table <onboarding@resend.dev>',
            to,
            subject,
            html,
        });

        if (error) {
            console.error('[EMAIL ERROR]', error);
            return { success: false, error };
        }

        return { success: true, id: data?.id };
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return { success: false, error };
    }
}

// Email Templates
export function getBookingConfirmationEmail(params: {
    guestName: string;
    offeringName: string;
    date: string;
    time: string;
    guestCount: number;
    totalAmount: string;
    bookingNumber: string;
    qrCode?: string;
}) {
    return {
        subject: `Booking Confirmed: ${params.offeringName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .success-icon { width: 64px; height: 64px; background: #22c55e; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .success-icon svg { width: 32px; height: 32px; color: white; }
        h1 { margin: 0; font-size: 24px; }
        .booking-number { color: #666; font-size: 14px; margin-top: 4px; }
        .details { background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; }
        .qr-code { text-align: center; margin: 24px 0; }
        .qr-code img { width: 150px; height: 150px; border-radius: 8px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="success-icon">✓</div>
        <h1>You're confirmed!</h1>
        <p class="booking-number">Booking #${params.bookingNumber}</p>
    </div>
    
    <div class="details">
        <div class="detail-row">
            <span class="detail-label">Event</span>
            <strong>${params.offeringName}</strong>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date</span>
            <span>${params.date}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Time</span>
            <span>${params.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Guests</span>
            <span>${params.guestCount}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total</span>
            <strong>${params.totalAmount}</strong>
        </div>
    </div>

    ${params.qrCode ? `
    <div class="qr-code">
        <p>Show this QR code at check-in:</p>
        <img src="${params.qrCode}" alt="Check-in QR Code" />
    </div>
    ` : ''}

    <div class="footer">
        <p>Thank you for booking with Garden Table!</p>
        <p>If you need to modify or cancel your booking, please contact us.</p>
    </div>
</body>
</html>
        `
    };
}

export function getReminderEmail(params: {
    guestName: string;
    offeringName: string;
    date: string;
    time: string;
    address?: string;
}) {
    return {
        subject: `Reminder: ${params.offeringName} is tomorrow!`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 24px; margin-bottom: 16px; }
        .highlight { background: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <h1>Hi ${params.guestName}! 👋</h1>
    
    <p>Just a friendly reminder that <strong>${params.offeringName}</strong> is happening tomorrow!</p>
    
    <div class="highlight">
        <p><strong>📅 ${params.date}</strong></p>
        <p><strong>🕐 ${params.time}</strong></p>
        ${params.address ? `<p><strong>📍 ${params.address}</strong></p>` : ''}
    </div>

    <p>We can't wait to see you there!</p>

    <div class="footer">
        <p>Garden Table</p>
    </div>
</body>
</html>
        `
    };
}

export function getWaitlistAvailableEmail(params: {
    guestName: string;
    offeringName: string;
    date: string;
    time: string;
    expiresIn: string;
    bookingUrl: string;
}) {
    return {
        subject: `🎉 A spot opened up for ${params.offeringName}!`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 24px; margin-bottom: 16px; }
        .cta { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
        .warning { background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <h1>Great news, ${params.guestName}! 🎉</h1>
    
    <p>A spot just opened up for <strong>${params.offeringName}</strong>!</p>
    
    <p><strong>📅 ${params.date}</strong> at <strong>${params.time}</strong></p>

    <div class="warning">
        <p>⏰ <strong>Act fast!</strong> This spot is held for you for ${params.expiresIn}.</p>
    </div>

    <a href="${params.bookingUrl}" class="cta">Book Now</a>

    <div class="footer">
        <p>Garden Table</p>
    </div>
</body>
</html>
        `
    };
}
