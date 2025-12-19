'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { submitReport, type ReportCategory, type ReportTargetType } from '@/actions/safety';
import { toast } from 'sonner';

interface ReportButtonProps {
    targetType: ReportTargetType;
    targetId: string;
}

const CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
    { value: 'SCAM', label: 'Scam or Fraud', description: 'This appears to be a scam or fraudulent activity' },
    { value: 'UNSAFE', label: 'Safety Concern', description: 'This poses a safety risk to guests' },
    { value: 'OFFENSIVE', label: 'Offensive Content', description: 'Contains offensive or inappropriate content' },
    { value: 'SPAM', label: 'Spam', description: 'This is spam or unwanted content' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate', description: 'This violates community guidelines' },
    { value: 'OTHER', label: 'Other', description: 'Something else' },
];

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedCategory) {
            toast.error('Please select a category');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitReport({
                targetType,
                targetId,
                category: selectedCategory,
                details: details.trim() || undefined,
            });

            if (result.success) {
                toast.success('Report submitted. Our team will review it shortly.');
                setShowModal(false);
                setSelectedCategory(null);
                setDetails('');
            } else {
                toast.error(result.error || 'Failed to submit report');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
                Report
            </button>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-2">Report Content</h2>
                        <p className="text-gray-600 mb-6">
                            Help us keep Garden Table safe by reporting content that violates our guidelines.
                        </p>

                        <div className="space-y-3 mb-6">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${selectedCategory === cat.value
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">{cat.label}</div>
                                    <div className="text-sm text-gray-600">{cat.description}</div>
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional details (optional)
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Provide any additional information that might help us..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 transition-colors resize-none"
                                rows={4}
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {details.length}/500 characters
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="default"
                                className="flex-1"
                                disabled={!selectedCategory || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            False reports may result in account restrictions. Reports are anonymous unless
                            you choose to provide contact information.
                        </p>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
