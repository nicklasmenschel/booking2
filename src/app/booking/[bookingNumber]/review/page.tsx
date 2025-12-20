import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { ReviewForm } from './review-form';

interface ReviewPageProps {
    params: Promise<{ bookingNumber: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const { userId } = await auth();
    const { bookingNumber } = await params;

    if (!userId) {
        redirect('/sign-in');
    }

    // Get booking by bookingNumber
    const booking = await db.booking.findUnique({
        where: { bookingNumber },
        include: {
            user: true,
            offering: true,
            instance: true,
            review: true,
        },
    });

    if (!booking) {
        notFound();
    }

    // Verify ownership
    if (booking.user?.clerkId !== userId) {
        redirect('/');
    }

    // Check if already reviewed
    if (booking.review) {
        redirect(`/booking/${booking.bookingNumber}`);
    }

    // Check if booking is completed
    if (!['COMPLETED', 'CHECKED_IN'].includes(booking.status)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Not Yet Available</h1>
                    <p className="text-gray-600">
                        You can only review completed bookings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container max-w-2xl py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Write a Review</h1>
                    <p className="text-gray-600">
                        Share your experience at {booking.offering.name}
                    </p>
                </div>

                <ReviewForm
                    bookingId={booking.id}
                    offeringName={booking.offering.name}
                    coverImage={booking.offering.coverImage}
                    date={booking.instance.date}
                />
            </div>
        </div>
    );
}
