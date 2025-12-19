import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendEmail, getBookingConfirmationEmail } from "@/lib/email";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { processWaitlist } from "@/jobs/process-waitlist";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    if (event.type === "payment_intent.succeeded") {
        // Update booking status
        const updatedBookings = await db.booking.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
                paymentStatus: "CAPTURED",
            },
        });

        // Send Confirmation Email
        const booking = await db.booking.findFirst({
            where: { stripePaymentIntentId: paymentIntent.id },
            include: {
                offering: true,
                instance: true
            }
        });

        if (booking) {
            const template = getBookingConfirmationEmail({
                guestName: booking.guestName,
                offeringName: booking.offering.name,
                date: formatDate(booking.instance.date),
                time: formatTime(booking.instance.startTime),
                guestCount: booking.guestCount,
                totalAmount: formatCurrency(Number(booking.totalAmount), booking.offering.currency),
                bookingNumber: booking.bookingNumber,
                qrCode: booking.qrCode || undefined
            });

            await sendEmail({
                to: booking.guestEmail,
                subject: template.subject,
                html: template.html
            });

            // Mark confirmation sent
            await db.booking.update({
                where: { id: booking.id },
                data: { confirmationSent: true }
            });

            // Log email
            await db.emailLog.create({
                data: {
                    to: booking.guestEmail,
                    subject: template.subject,
                    type: "CONFIRMATION",
                    status: "SENT"
                }
            });

            console.log(`[WEBHOOK] Confirmation email sent to ${booking.guestEmail}`);
        }
    }

    if (event.type === "payment_intent.payment_failed") {
        await db.booking.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
                paymentStatus: "FAILED",
                status: "CANCELLED",
            },
        });

        // Release the spot on the instance
        const booking = await db.booking.findFirst({
            where: { stripePaymentIntentId: paymentIntent.id },
            include: { instance: true }
        });

        if (booking) {
            const updatedInstance = await db.eventInstance.update({
                where: { id: booking.instanceId },
                data: {
                    availableSpots: { increment: booking.guestCount },
                    status: "AVAILABLE"
                }
            });

            // Trigger waitlist processing
            // Trigger waitlist processing
            await processWaitlist({
                instanceId: booking.instanceId,
                spotsAvailable: updatedInstance.availableSpots
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
