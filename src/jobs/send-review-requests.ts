import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function sendReviewRequests() {
    console.log("[JOB] Sending review requests...");

    const now = new Date();
    const twoDaysAgo = subDays(now, 2);

    // Find completed bookings from 2 days ago
    const bookings = await db.booking.findMany({
        where: {
            status: {
                in: ["COMPLETED", "CHECKED_IN"]
            },
            checkedIn: true,
            instance: {
                date: {
                    gte: startOfDay(twoDaysAgo),
                    lte: endOfDay(twoDaysAgo),
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
            instance: {
                include: {
                    bookings: {
                        where: {
                            status: {
                                in: ["COMPLETED", "CHECKED_IN"]
                            },
                            checkedIn: true,
                        }
                    }
                }
            },
            review: true,
        }
    });

    console.log(`[JOB] Found ${bookings.length} potential review candidates`);

    for (const booking of bookings) {
        try {
            // Skip if review already exists
            if (booking.review) {
                continue;
            }

            // Calculate attendance rate
            const totalBookings = booking.instance.bookings.length;
            const checkedInBookings = booking.instance.bookings.filter(b => b.checkedIn).length;
            const attendanceRate = totalBookings > 0 ? (checkedInBookings / totalBookings) : 0;

            // Only send if attendance > 70% (quality check)
            if (attendanceRate < 0.7) {
                console.log(`[JOB] Skipping review for ${booking.id}: Low attendance (${Math.round(attendanceRate * 100)}%)`);
                continue;
            }

            const template = getReviewRequestEmail({
                guestName: booking.guestName,
                offeringName: booking.offering.name,
                bookingDate: formatDate(booking.instance.date),
                bookingId: booking.id,
                offeringSlug: booking.offering.slug,
            });

            await sendEmail({
                to: booking.guestEmail,
                subject: template.subject,
                html: template.html
            });

            // Log to system
            await db.emailLog.create({
                data: {
                    to: booking.guestEmail,
                    subject: template.subject,
                    type: "REVIEW_REQUEST",
                    status: "SENT"
                }
            });

            console.log(`[JOB] Sent review request to ${booking.guestEmail}`);

        } catch (e) {
            console.error("[JOB] Failed to send review request", e);
        }
    }

    console.log("[JOB] Review request job complete");
}

interface ReviewRequestEmailParams {
    guestName: string;
    offeringName: string;
    bookingDate: string;
    bookingId: string;
    offeringSlug: string;
}

function getReviewRequestEmail(params: ReviewRequestEmailParams) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gardentable.com';
    const reviewUrl = `${baseUrl}/booking/${params.bookingId}/review`;

    return {
        subject: `How was your experience at ${params.offeringName}?`,
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
                    .stars { font-size: 32px; text-align: center; margin: 20px 0; }
                    .button { display: inline-block; background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>How was your experience?</h1>
                    </div>

                    <div class="content">
                        <p>Hi ${params.guestName},</p>

                        <p>We hope you enjoyed <strong>${params.offeringName}</strong> on ${params.bookingDate}!</p>

                        <p>Your feedback means a lot to us and helps other guests discover great experiences. Would you mind taking a moment to share your thoughts?</p>

                        <div class="stars">⭐⭐⭐⭐⭐</div>

                        <div style="text-align: center;">
                            <a href="${reviewUrl}" class="button">Leave a Review</a>
                        </div>

                        <p style="color: #666; font-size: 14px;">It only takes a minute and makes a huge difference.</p>
                    </div>

                    <div class="footer">
                        <p>Thank you for being part of Garden Table!</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
}
