"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { respondToReview } from "@/actions/marketing";
import { toast } from "@/components/ui/toast";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ReviewManagementProps {
    reviews: any[];
}

export function ReviewManagement({ reviews: initialReviews }: ReviewManagementProps) {
    const [reviews, setReviews] = useState(initialReviews);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [response, setResponse] = useState("");

    const handleRespond = async (reviewId: string) => {
        try {
            await respondToReview(reviewId, response);
            setReviews(
                reviews.map((r) =>
                    r.id === reviewId
                        ? { ...r, hostResponse: response, hostRespondedAt: new Date() }
                        : r
                )
            );
            setRespondingTo(null);
            setResponse("");
            toast({
                title: "Response posted",
                description: "Your response has been published.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to post response.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Guest Reviews</h1>
                <p className="text-slate-600 mt-1">Manage and respond to guest feedback</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm divide-y">
                {reviews.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">
                        No reviews yet. Reviews will appear here after guests visit.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900">
                                            {review.booking.guestName}
                                        </h3>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-slate-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>

                            {review.comment && (
                                <p className="text-slate-700">{review.comment}</p>
                            )}

                            {review.hostResponse ? (
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="h-4 w-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-900">
                                            Your Response
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700">{review.hostResponse}</p>
                                </div>
                            ) : respondingTo === review.id ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Write your response..."
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleRespond(review.id)}
                                            size="sm"
                                        >
                                            Post Response
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setRespondingTo(null);
                                                setResponse("");
                                            }}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setRespondingTo(review.id)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Respond
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
