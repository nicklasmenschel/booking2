'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { modifyPartySize, changeBookingDate, cancelBookingWithRefund } from '@/actions/modifications';
import { toast } from 'sonner';
import { Users, Calendar, X } from 'lucide-react';

interface ModifyBookingModalProps {
    bookingId: string;
    currentPartySize: number;
    currentInstanceId: string;
    availableInstances: Array<{
        id: string;
        date: Date;
        startTime: Date;
        availableSpots: number;
    }>;
    maxPartySize?: number;
    cancellationPolicy: string;
}

export function ModifyBookingModal({
    bookingId,
    currentPartySize,
    availableInstances,
    maxPartySize = 10,
    cancellationPolicy,
}: ModifyBookingModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'partySize' | 'date' | 'cancel'>('partySize');
    const [newPartySize, setNewPartySize] = useState(currentPartySize);
    const [selectedInstance, setSelectedInstance] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleModifyPartySize = async () => {
        if (newPartySize === currentPartySize) {
            toast.error('Please select a different party size');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await modifyPartySize(bookingId, newPartySize);

            if (result.success) {
                toast.success(
                    result.priceDifference && result.priceDifference > 0
                        ? `Party size updated. Additional $${result.priceDifference.toFixed(2)} charged.`
                        : result.priceDifference && result.priceDifference < 0
                            ? `Party size updated. $${Math.abs(result.priceDifference).toFixed(2)} refunded.`
                            : 'Party size updated.'
                );
                setShowModal(false);
                window.location.reload();
            } else {
                toast.error(result.error || 'Failed to update party size');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeDate = async () => {
        if (!selectedInstance) {
            toast.error('Please select a new date');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await changeBookingDate(bookingId, selectedInstance);

            if (result.success) {
                toast.success('Booking date changed successfully');
                setShowModal(false);
                window.location.reload();
            } else {
                toast.error(result.error || 'Failed to change date');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await cancelBookingWithRefund(bookingId);

            if (result.success) {
                toast.success(
                    result.refundAmount && result.refundAmount > 0
                        ? `Booking cancelled. $${result.refundAmount.toFixed(2)} will be refunded.`
                        : 'Booking cancelled.'
                );
                setShowModal(false);
                window.location.reload();
            } else {
                toast.error(result.error || 'Failed to cancel booking');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowModal(true)}
            >
                Modify Booking
            </Button>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Modify Booking</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 border-b">
                            <button
                                onClick={() => setActiveTab('partySize')}
                                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'partySize'
                                        ? 'border-b-2 border-black text-black'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Users className="h-4 w-4 inline mr-2" />
                                Party Size
                            </button>
                            <button
                                onClick={() => setActiveTab('date')}
                                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'date'
                                        ? 'border-b-2 border-black text-black'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Calendar className="h-4 w-4 inline mr-2" />
                                Date/Time
                            </button>
                            <button
                                onClick={() => setActiveTab('cancel')}
                                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'cancel'
                                        ? 'border-b-2 border-red-500 text-red-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Party Size Tab */}
                        {activeTab === 'partySize' && (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Current: {currentPartySize} {currentPartySize === 1 ? 'guest' : 'guests'}
                                </p>

                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setNewPartySize(Math.max(1, newPartySize - 1))}
                                        disabled={newPartySize <= 1}
                                    >
                                        −
                                    </Button>
                                    <span className="text-3xl font-bold w-16 text-center">
                                        {newPartySize}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setNewPartySize(Math.min(maxPartySize, newPartySize + 1))}
                                        disabled={newPartySize >= maxPartySize}
                                    >
                                        +
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-gray-500">
                                    Max {maxPartySize} guests
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleModifyPartySize}
                                    disabled={isSubmitting || newPartySize === currentPartySize}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Party Size'}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    Price will be adjusted accordingly
                                </p>
                            </div>
                        )}

                        {/* Date Tab */}
                        {activeTab === 'date' && (
                            <div className="space-y-4">
                                <p className="text-gray-600 mb-4">Select a new date and time:</p>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {availableInstances.map((instance) => (
                                        <button
                                            key={instance.id}
                                            onClick={() => setSelectedInstance(instance.id)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${selectedInstance === instance.id
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            disabled={instance.availableSpots < currentPartySize}
                                        >
                                            <div className="font-semibold">
                                                {new Date(instance.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {new Date(instance.startTime).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {instance.availableSpots} spots available
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleChangeDate}
                                    disabled={isSubmitting || !selectedInstance}
                                >
                                    {isSubmitting ? 'Changing...' : 'Change Date'}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    Changes not allowed within 48 hours of event
                                </p>
                            </div>
                        )}

                        {/* Cancel Tab */}
                        {activeTab === 'cancel' && (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="font-semibold text-red-900 mb-2">Cancellation Policy</p>
                                    <p className="text-sm text-red-700">{cancellationPolicy}</p>
                                </div>

                                <p className="text-gray-600">
                                    Are you sure you want to cancel this booking? This action cannot be undone.
                                </p>

                                <Button
                                    variant="outline"
                                    className="w-full border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </>
    );
}
