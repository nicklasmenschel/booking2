import { db } from "@/lib/db";
import { sendEmail, getWaitlistAvailableEmail } from "@/lib/email";
import { formatDate, formatTime } from "@/lib/utils";

interface ProcessWaitlistPayload {
    instanceId: string;
    spotsAvailable: number;
}

export async function processWaitlist(payload: ProcessWaitlistPayload) {
    const { instanceId, spotsAvailable } = payload;
    console.log(`[JOB] Processing waitlist for instance ${instanceId}, spots: ${spotsAvailable}`);

    try {
        // Get instance and offering details
        const instance = await db.eventInstance.findUnique({
            where: { id: instanceId },
            include: { offering: true }
        });

        if (!instance) {
            console.log(`[JOB] Instance ${instanceId} not found`);
            return;
        }

        // Find next eligible person
        const nextInLine = await db.waitlist.findFirst({
            where: {
                instanceId,
                status: "ACTIVE",
                partySize: { lte: spotsAvailable }
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' }
            ]
        });

        if (!nextInLine) {
            console.log(`[JOB] No eligible waitlist members found for instance ${instanceId}`);
            return;
        }

        console.log(`[JOB] Notifying waitlist member ${nextInLine.guestEmail}`);

        // Update status
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hour window
        await db.waitlist.update({
            where: { id: nextInLine.id },
            data: {
                status: "NOTIFIED",
                notifiedAt: new Date(),
                expiresAt
            }
        });

        // Send email
        const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/e/${instance.offering.slug}`;
        const template = getWaitlistAvailableEmail({
            guestName: nextInLine.guestName,
            offeringName: instance.offering.name,
            date: formatDate(instance.date),
            time: formatTime(instance.startTime),
            expiresIn: "2 hours",
            bookingUrl
        });

        await sendEmail({
            to: nextInLine.guestEmail,
            subject: template.subject,
            html: template.html
        });

        // Log email
        await db.emailLog.create({
            data: {
                to: nextInLine.guestEmail,
                subject: template.subject,
                type: "WAITLIST_AVAILABLE",
                status: "SENT"
            }
        });

        console.log(`[JOB] Sent waitlist notification to ${nextInLine.guestEmail}`);

    } catch (error) {
        console.error("[JOB] Error processing waitlist:", error);
        throw error;
    }
}
