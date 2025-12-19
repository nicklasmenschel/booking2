import { db } from "@/lib/db";
import { sendEmail, getReminderEmail } from "@/lib/email";
import { formatDate, formatTime } from "@/lib/utils";
import { sendSMS, smsTemplates } from "@/lib/sms";

export async function sendReminders() {
    console.log("[JOB] Checking for reminders...");

    const now = new Date();

    // ========== 24-HOUR REMINDERS ==========
    const rangeStart24h = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const rangeEnd24h = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    const bookings24h = await db.booking.findMany({
        where: {
            status: "CONFIRMED",
            reminder24hSent: false,
            instance: {
                startTime: {
                    gte: rangeStart24h,
                    lte: rangeEnd24h
                }
            }
        },
        include: {
            user: true,
            offering: true,
            instance: true
        }
    });

    console.log(`[JOB] Found ${bookings24h.length} bookings needing 24h reminder`);

    for (const booking of bookings24h) {
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
            console.error("[JOB] Failed to send 24h reminder", e);
        }
    }

    // ========== 2-HOUR REMINDERS (EMAIL + SMS) ==========
    const rangeStart2h = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
    const rangeEnd2h = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

    const bookings2h = await db.booking.findMany({
        where: {
            status: "CONFIRMED",
            reminder2hSent: false,
            instance: {
                startTime: {
                    gte: rangeStart2h,
                    lte: rangeEnd2h
                }
            }
        },
        include: {
            user: true,
            offering: true,
            instance: true
        }
    });

    console.log(`[JOB] Found ${bookings2h.length} bookings needing 2h reminder`);

    for (const booking of bookings2h) {
        try {
            // Send email reminder
            const template = getReminderEmail({
                guestName: booking.guestName,
                offeringName: booking.offering.name,
                date: formatDate(booking.instance.date),
                time: formatTime(booking.instance.startTime),
                address: booking.offering.address || undefined
            });

            await sendEmail({
                to: booking.guestEmail,
                subject: `[2 Hours] ${template.subject}`,
                html: template.html
            });

            // Send SMS if user opted in
            if (booking.user?.smsOptIn && booking.guestPhone) {
                const smsMessage = smsTemplates.reminder2h(
                    booking.guestName,
                    booking.offering.name,
                    formatTime(booking.instance.startTime)
                );

                await sendSMS({
                    to: booking.guestPhone,
                    message: smsMessage,
                    userId: booking.userId || undefined,
                });
            }

            // Mark as sent
            await db.booking.update({
                where: { id: booking.id },
                data: { reminder2hSent: true }
            });

            // Log to system
            await db.emailLog.create({
                data: {
                    to: booking.guestEmail,
                    subject: `[2 Hours] ${template.subject}`,
                    type: "REMINDER_2H",
                    status: "SENT"
                }
            });

            console.log(`[JOB] Sent 2h reminder to ${booking.guestEmail}`);

        } catch (e) {
            console.error("[JOB] Failed to send 2h reminder", e);
        }
    }

    console.log("[JOB] Reminder job complete");
}
