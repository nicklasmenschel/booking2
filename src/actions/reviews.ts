'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

/**
 * Submit a review for a completed booking
 */
export async function submitReview(data: {
    bookingId: string;
    rating: number;
    comment?: string;
    photos?: string[];
}) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Validate rating
        if (data.rating < 1 || data.rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' };
        }

        // Get booking with relations
        const booking = await db.booking.findUnique({
            where: { id: data.bookingId },
            include: {
                user: true,
                offering: {
                    include: {
                        host: true,
                    },
                },
                instance: true,
                review: true,
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        // Verify ownership
        if (booking.user?.clerkId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Verify booking is completed
        if (!['COMPLETED', 'CHECKED_IN'].includes(booking.status)) {
            return { success: false, error: 'Can only review completed bookings' };
        }

        // Check if review already exists
        if (booking.review) {
            return { success: false, error: 'Review already submitted' };
        }

        // Auto-moderate
        const moderation = await moderateReview({
            rating: data.rating,
            comment: data.comment,
        });

        // Create review
        const review = await db.review.create({
            data: {
                bookingId: data.bookingId,
                userId: booking.userId!,
                offeringId: booking.offeringId,
                rating: data.rating,
                comment: data.comment,
                photos: data.photos || [],
                status: moderation.autoPublish ? 'PUBLISHED' : 'PENDING',
            },
        });

        // Update offering's average rating
        await updateOfferingRating(booking.offeringId);

        // Notify host
        await sendEmail({
            to: booking.offering.host.email!,
            subject: 'New Review Received',
            html: `
        <h2>You received a new review!</h2>
        <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)}</p>
        ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ''}
        <p>View and respond in your dashboard.</p>
      `,
        });

        revalidatePath(`/e/${booking.offering.slug}`);
        revalidatePath('/dashboard');

        return { success: true, reviewId: review.id };
    } catch (error: any) {
        console.error('Submit review error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Host response to a review
 */
export async function respondToReview(reviewId: string, response: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const review = await db.review.findUnique({
            where: { id: reviewId },
            include: {
                offering: {
                    include: {
                        host: true,
                    },
                },
                user: true,
            },
        });

        if (!review) {
            return { success: false, error: 'Review not found' };
        }

        // Verify user is the host
        if (review.offering.host.clerkId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Update review with host response
        await db.review.update({
            where: { id: reviewId },
            data: {
                hostResponse: response,
                hostRespondedAt: new Date(),
            },
        });

        // Notify guest
        if (review.user?.email) {
            await sendEmail({
                to: review.user.email,
                subject: 'Host Responded to Your Review',
                html: `
          <h2>The host responded to your review</h2>
          <p><strong>Your review:</strong> ${'⭐'.repeat(review.rating)}</p>
          ${review.comment ? `<p>"${review.comment}"</p>` : ''}
          <p><strong>Host response:</strong></p>
          <p>"${response}"</p>
        `,
            });
        }

        revalidatePath(`/e/${review.offering.slug}`);
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Respond to review error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get reviews for an offering
 */
export async function getOfferingReviews(offeringId: string, limit = 3) {
    const reviews = await db.review.findMany({
        where: {
            offeringId,
            status: 'PUBLISHED',
        },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: [
            { createdAt: 'desc' },
        ],
        take: limit,
    });

    return reviews;
}

/**
 * Get all reviews for an offering (with pagination)
 */
export async function getAllOfferingReviews(
    offeringId: string,
    page = 1,
    limit = 10
) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        db.review.findMany({
            where: {
                offeringId,
                status: 'PUBLISHED',
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            skip,
            take: limit,
        }),
        db.review.count({
            where: {
                offeringId,
                status: 'PUBLISHED',
            },
        }),
    ]);

    return {
        reviews,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
    };
}

/**
 * Update offering's average rating
 */
async function updateOfferingRating(offeringId: string) {
    const result = await db.review.aggregate({
        where: {
            offeringId,
            status: 'PUBLISHED',
        },
        _avg: {
            rating: true,
        },
        _count: true,
    });

    await db.offering.update({
        where: { id: offeringId },
        data: {
            averageRating: result._avg.rating || 0,
            reviewCount: result._count,
        },
    });
}

/**
 * Auto-moderate review content
 */
async function moderateReview(review: {
    rating: number;
    comment?: string;
}): Promise<{ autoPublish: boolean; flags: string[] }> {
    const flags: string[] = [];

    // Auto-publish 4-5 star reviews
    if (review.rating >= 4) {
        return { autoPublish: true, flags };
    }

    // Flag 1-2 star reviews for manual review
    if (review.rating <= 2) {
        flags.push('LOW_RATING');
    }

    // Simple profanity check (expand as needed)
    if (review.comment) {
        const profanityWords = ['spam', 'scam', 'fake', 'fraud'];
        const lowerComment = review.comment.toLowerCase();

        for (const word of profanityWords) {
            if (lowerComment.includes(word)) {
                flags.push('POTENTIAL_SPAM');
                break;
            }
        }
    }

    // Auto-publish 3-star reviews without flags
    const autoPublish = review.rating === 3 && flags.length === 0;

    return { autoPublish, flags };
}

/**
 * Get reviews pending moderation (admin only)
 */
export async function getPendingReviews() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }

    const reviews = await db.review.findMany({
        where: {
            status: 'PENDING',
        },
        include: {
            offering: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return reviews;
}

/**
 * Approve/reject a review (admin only)
 */
export async function moderateReviewAction(
    reviewId: string,
    action: 'APPROVE' | 'REJECT'
) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const review = await db.review.update({
            where: { id: reviewId },
            data: {
                status: action === 'APPROVE' ? 'PUBLISHED' : 'HIDDEN',
            },
            include: {
                offering: true,
            },
        });

        // Update offering rating if approved
        if (action === 'APPROVE') {
            await updateOfferingRating(review.offeringId);
        }

        revalidatePath(`/e/${review.offering.slug}`);
        revalidatePath('/admin');

        return { success: true };
    } catch (error: any) {
        console.error('Moderate review error:', error);
        return { success: false, error: error.message };
    }
}
