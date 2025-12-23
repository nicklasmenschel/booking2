
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { confirmBookingPayment } from "@/actions/bookings";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const bookingNumber = searchParams.get("booking");

    const results: any = {
        key_configured: !!process.env.RESEND_API_KEY,
        booking_number: bookingNumber,
    };

    if (process.env.RESEND_API_KEY) {
        results.key_prefix = process.env.RESEND_API_KEY.substring(0, 5) + "...";
    }

    // 1. Try sending a raw test email
    try {
        const testEmail = await sendEmail({
            to: "nicklasmenschel@gmail.com", // Fallback or use a known test email
            subject: "Debug Test Email",
            html: "<p>If you see this, Resend is working.</p>"
        });
        results.email_test = { success: true, data: testEmail };
    } catch (error: any) {
        results.email_test = { success: false, error: error.message };
    }

    // 2. Check and confirm booking
    if (bookingNumber) {
        try {
            const booking = await db.booking.findUnique({
                where: { bookingNumber }
            });

            results.booking_found = !!booking;
            results.booking_status = booking?.status;

            if (booking) {
                // Determine email to test with
                const guestEmail = booking.guestEmail;
                results.guest_email = guestEmail;

                if (booking.status !== "CONFIRMED") {
                    const confirmResult = await confirmBookingPayment(bookingNumber);
                    results.confirmation_attempt = confirmResult;
                } else {
                    results.message = "Booking already confirmed";
                    // Force send another email anyway to test
                    try {
                        await sendEmail({
                            to: guestEmail,
                            subject: `Manual Confirmation for ${bookingNumber}`,
                            html: `<p>Your booking ${bookingNumber} is confirmed.</p>`
                        });
                        results.forced_email_attempt = "Sent manual confirmation email";
                    } catch (e: any) {
                        results.forced_email_attempt = `Failed: ${e.message}`;
                    }
                }
            }
        } catch (error: any) {
            results.booking_error = error.message;
        }
    }

    return NextResponse.json(results);
}
