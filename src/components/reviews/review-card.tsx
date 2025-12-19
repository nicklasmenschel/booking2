import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    hostResponse: string | null;
    hostRespondedAt: Date | null;
    guest: {
        name: string | null;
    } | null;
}

interface ReviewCardProps {
    review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
    const guestName = review.guest?.name?.split(' ')[0] || 'Guest';
    const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });

    return (
        <Card className="p-6">
            {/* Guest Info */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                    {guestName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="font-semibold">{guestName}</div>
                    <div className="text-sm text-gray-500">{reviewDate}</div>
                </div>
            </div>

            {/* Rating */}
            <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>

            {/* Comment */}
            {review.comment && (
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
            )}

            {/* Host Response */}
            {review.hostResponse && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="font-semibold text-sm mb-2">Host response:</div>
                        <p className="text-gray-700 text-sm">{review.hostResponse}</p>
                        {review.hostRespondedAt && (
                            <div className="text-xs text-gray-500 mt-2">
                                {new Date(review.hostRespondedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}

interface ReviewsSection {
    reviews: Review[];
    averageRating: number;
    reviewCount: number;
    offeringSlug: string;
}

export function ReviewsSection({
    reviews,
    averageRating,
    reviewCount,
    offeringSlug,
}: ReviewsSection) {
    if (reviewCount === 0) {
        return null;
    }

    return (
        <div className="my-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        {averageRating.toFixed(1)}
                        <span className="text-gray-500 font-normal">
                            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                    </h2>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>

            {/* View All Link */}
            {reviewCount > reviews.length && (
                <div className="mt-6 text-center">
                    <a
                        href={`/e/${offeringSlug}/reviews`}
                        className="inline-flex items-center justifycenter px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:border-black transition-colors"
                    >
                        See all {reviewCount} reviews
                    </a>
                </div>
            )}
        </div>
    );
}
