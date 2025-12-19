import { db } from "@/lib/db";
import { sendEmail, getReminderEmail } from "@/lib/email";
import { formatDate, formatTime } from "@/lib/utils";

export async function sendReminders() {
    console.log("[JOB] Checking for reminders...");

    // logic to find bookings starting in ~24h (23.5 - 24.5h range)
    const now = new Date();
    const rangeStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const rangeEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    const bookings = await db.booking.findMany({
        where: {
            status: "CONFIRMED",
            reminder24hSent: false,
            instance: {
                startTime: {
                    gte: rangeStart,
                    lte: rangeEnd
                }
            }
        },
        include: {
            user: true,
            offering: true,
            instance: true
        }
    });

    console.log(`[JOB] Found ${bookings.length} bookings needing 24h reminder`);

    for (const booking of bookings) {
        try {
            const template = getReminderEmail({
                guestName: booking.guestName,
                offeringName: booking.offering.name,
                date: formatDate(booking.instance.date),
                time: formatTime(booking.instance.startTime),
                address: booking.offering.address || undefined
            });

            await sendEmail({
                to: booking.guestEmail,
                subject: template.subject,
                html: template.html
            });

            // Mark as sent
            await db.booking.update({
                where: { id: booking.id },
                data: { reminder24hSent: true }
            });

            // Log to system
            await db.emailLog.create({
                data: {
                    to: booking.guestEmail,
                    subject: template.subject,
                    type: "REMINDER_24H",
                    status: "SENT"
                }
            });

            console.log(`[JOB] Sent 24h reminder to ${booking.guestEmail}`);

        } catch (e) {
            console.error("[JOB] Failed to send reminder", e);
        }
    }
}
