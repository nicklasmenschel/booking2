import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

function getTwilioClient() {
    if (!accountSid || !authToken) {
        console.warn('Twilio credentials not configured');
        return null;
    }

    if (!client) {
        client = twilio(accountSid, authToken);
    }

    return client;
}

export interface SendSMSParams {
    to: string;
    message: string;
    userId?: string;
}

export async function sendSMS({ to, message, userId }: SendSMSParams) {
    const client = getTwilioClient();

    if (!client || !twilioPhoneNumber) {
        console.warn('SMS not sent: Twilio not configured');
        return { success: false, error: 'SMS service not configured' };
    }

    try {
        // Format phone number (ensure E.164 format)
        const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: formattedPhone,
        });

        // Log to database
        const { db } = await import('./db');
        await db.sMSLog.create({
            data: {
                userId,
                phone: formattedPhone,
                message,
                cost: 0.0075, // Average Twilio cost per SMS
                status: 'SENT',
                provider: 'Twilio',
            },
        });

        console.log(`SMS sent to ${formattedPhone}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error: any) {
        console.error('Failed to send SMS:', error);

        // Log failed attempt
        const { db } = await import('./db');
        await db.sMSLog.create({
            data: {
                userId,
                phone: to,
                message,
                cost: 0,
                status: 'FAILED',
                provider: 'Twilio',
                error: error.message,
            },
        });

        return { success: false, error: error.message };
    }
}

// Pre-built SMS templates
export const smsTemplates = {
    reminder2h: (guestName: string, eventName: string, startTime: string) =>
        `Hi ${guestName}! Your event "${eventName}" starts in 2 hours at ${startTime}. See you soon!`,

    waitlistAvailable: (guestName: string, eventName: string) =>
        `Good news ${guestName}! A spot just opened up for "${eventName}". Book now before it's gone!`,

    bookingConfirmed: (guestName: string, eventName: string, date: string) =>
        `Confirmed! Your booking for "${eventName}" on ${date}. Check your email for details.`,

    bookingCancelled: (guestName: string, eventName: string) =>
        `Your booking for "${eventName}" has been cancelled. Refund processed. Questions? Reply to this message.`,
};
