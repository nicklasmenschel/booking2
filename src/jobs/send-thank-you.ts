import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function sendThankYouEmails() {
    console.log("[JOB] Sending thank you emails...");

    const now = new Date();
    const yesterday = subDays(now, 1);

    // Find completed bookings from yesterday that haven't received thank you
    const bookings = await db.booking.findMany({
        where: {
            status: {
                in: ["COMPLETED", "CHECKED_IN"]
            },
            checkedIn: true,
            thankYouSent: false,
            instance: {
                date: {
                    gte: startOfDay(yesterday),
                    lte: endOfDay(yesterday),
                }
            }
        },
        include: {
            user: true,
            offering: {
                include: {
                    host: true,
                }
            },
            instance: true
        }
    });

    console.log(`[JOB] Found ${bookings.length} bookings needing thank you`);

    for (const booking of bookings) {
        try {
            const template = getThankYouEmail({
                guestName: booking.guestName,
                offeringName: booking.offering.name,
                hostName: booking.offering.host.name || "the host",
                bookingDate: formatDate(booking.instance.date),
                offeringSlug: booking.offering.slug,
                bookingId: booking.id,
            });

            await sendEmail({
                to: booking.guestEmail,
                subject: template.subject,
                html: template.html
            });

            // Mark as sent
            await db.booking.update({
                where: { id: booking.id },
                data: { thankYouSent: true }
            });

            // Log to system
            await db.emailLog.create({
                data: {
                    to: booking.guestEmail,
                    subject: template.subject,
                    type: "THANK_YOU",
                    status: "SENT"
                }
            });

            console.log(`[JOB] Sent thank you to ${booking.guestEmail}`);

        } catch (e) {
            console.error("[JOB] Failed to send thank you", e);
        }
    }

    console.log("[JOB] Thank you job complete");
}

interface ThankYouEmailParams {
    guestName: string;
    offeringName: string;
    hostName: string;
    bookingDate: string;
    offeringSlug: string;
    bookingId: string;
}

function getThankYouEmail(params: ThankYouEmailParams) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gardentable.com';
    const reviewUrl = `${baseUrl}/booking/${params.bookingId}/review`;
    const offeringUrl = `${baseUrl}/e/${params.offeringSlug}`;

    return {
        subject: `Thanks for joining us, ${params.guestName}!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .content { background: #f9fafb; border-radius: 12px; padding: 30px; }
                    .button { display: inline-block; background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thank You! 🎉</h1>
                    </div>

                    <div class="content">
                        <p>Hi ${params.guestName},</p>

                        <p>Thank you for joining us at <strong>${params.offeringName}</strong> on ${params.bookingDate}! We hope you had a wonderful time.</p>

                        <p>We'd love to hear about your experience. Your feedback helps us improve and helps other guests discover great events.</p>

                        <div style="text-align: center;">
                            <a href="${reviewUrl}" class="button">Leave a Review</a>
                        </div>

                        <p>We hope to see you again soon!</p>

                        <p>Warm regards,<br>${params.hostName}</p>
                    </div>

                    <div class="footer">
                        <p>
                            <a href="${offeringUrl}" style="color: #666;">See more events</a> |
                            <a href="${baseUrl}/discover" style="color: #666;">Discover new experiences</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
}
