'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { submitReview } from '@/actions/reviews';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

interface ReviewFormProps {
    bookingId: string;
    offeringName: string;
    coverImage: string;
    date: Date;
}

export function ReviewForm({
    bookingId,
    offeringName,
    coverImage,
    date,
}: ReviewFormProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitReview({
                bookingId,
                rating,
                comment: comment.trim() || undefined,
            });

            if (result.success) {
                toast.success('Review submitted! Thank you for your feedback.');
                router.push(`/dashboard`);
            } else {
                toast.error(result.error || 'Failed to submit review');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
            {/* Event Info */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <img
                    src={coverImage}
                    alt={offeringName}
                    className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                    <h3 className="font-semibold">{offeringName}</h3>
                    <p className="text-sm text-gray-600">
                        {new Date(date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            {/* Star Rating */}
            <div className="mb-8">
                <label className="block text-lg font-semibold mb-4">
                    How would you rate your experience?
                </label>
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-12 w-12 ${star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-center mt-2 text-gray-600">
                        {rating === 5
                            ? 'Amazing!'
                            : rating === 4
                                ? 'Great!'
                                : rating === 3
                                    ? 'Good'
                                    : rating === 2
                                        ? 'Okay'
                                        : 'Needs improvement'}
                    </p>
                )}
            </div>

            {/* Comment */}
            <div className="mb-8">
                <label htmlFor="comment" className="block text-lg font-semibold mb-2">
                    Share more about your experience (optional)
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like? What could be improved?"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 resize-none transition-colors"
                    rows={6}
                    maxLength={500}
                />
                <div className="text-sm text-gray-500 mt-1">
                    {comment.length}/500 characters
                </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1"
                    disabled={rating === 0 || isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
                Your review will be visible to other guests and the host
            </p>
        </form>
    );
}
