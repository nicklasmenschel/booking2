"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateReservationSettings } from "@/actions/reservations";
import { toast } from "@/components/ui/toast";
import { Save, Loader2 } from "lucide-react";

interface ReservationSettingsFormProps {
    restaurantId: string;
    settings: any;
}

export function ReservationSettingsForm({ restaurantId, settings }: ReservationSettingsFormProps) {
    const [formData, setFormData] = useState({
        confirmationMode: settings.confirmationMode || "AUTO",
        requireCreditCard: settings.requireCreditCard || false,
        requirePrepayment: settings.requirePrepayment || false,
        noShowCharge: settings.noShowCharge || 0,
        send24hReminder: settings.send24hReminder ?? true,
        send2hReminder: settings.send2hReminder ?? true,
        sendReviewRequest: settings.sendReviewRequest ?? true,
        reviewRequestDelay: settings.reviewRequestDelay || 24,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await updateReservationSettings(restaurantId, formData);
            toast({
                title: "Settings saved",
                description: "Your reservation settings have been updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Confirmation Mode */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Confirmation Workflow</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Choose how reservations are confirmed
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="confirmationMode"
                            value="MANUAL"
                            checked={formData.confirmationMode === "MANUAL"}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmationMode: e.target.value as any })
                            }
                            className="mt-1"
                        />
                        <div>
                            <div className="font-medium text-slate-900">Manual Confirmation</div>
                            <div className="text-sm text-slate-600">
                                Staff must manually approve each reservation request
                            </div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="confirmationMode"
                            value="AUTO"
                            checked={formData.confirmationMode === "AUTO"}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmationMode: e.target.value as any })
                            }
                            className="mt-1"
                        />
                        <div>
                            <div className="font-medium text-slate-900">Automatic Confirmation</div>
                            <div className="text-sm text-slate-600">
                                Reservations are automatically confirmed when submitted
                            </div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="confirmationMode"
                            value="AUTO_GUARANTEE"
                            checked={formData.confirmationMode === "AUTO_GUARANTEE"}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmationMode: e.target.value as any })
                            }
                            className="mt-1"
                        />
                        <div>
                            <div className="font-medium text-slate-900">
                                Automatic with Credit Card Guarantee
                            </div>
                            <div className="text-sm text-slate-600">
                                Guests must provide credit card to secure reservation
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Payment Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Payment Requirements</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Configure payment and guarantee requirements
                    </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.requireCreditCard}
                        onChange={(e) =>
                            setFormData({ ...formData, requireCreditCard: e.target.checked })
                        }
                    />
                    <div>
                        <div className="font-medium text-slate-900">Require Credit Card</div>
                        <div className="text-sm text-slate-600">
                            Guests must provide credit card for all reservations
                        </div>
                    </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.requirePrepayment}
                        onChange={(e) =>
                            setFormData({ ...formData, requirePrepayment: e.target.checked })
                        }
                    />
                    <div>
                        <div className="font-medium text-slate-900">Require Prepayment</div>
                        <div className="text-sm text-slate-600">
                            Guests must pay in advance when booking
                        </div>
                    </div>
                </label>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">
                        No-Show Charge Amount ($)
                    </label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.noShowCharge}
                        onChange={(e) =>
                            setFormData({ ...formData, noShowCharge: parseFloat(e.target.value) || 0 })
                        }
                        className="max-w-xs"
                    />
                    <p className="text-sm text-slate-600">
                        Amount to charge guests who don't show up (requires credit card)
                    </p>
                </div>
            </div>

            {/* Automated Communications */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Automated Communications</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Configure reminder and review request emails
                    </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.send24hReminder}
                        onChange={(e) =>
                            setFormData({ ...formData, send24hReminder: e.target.checked })
                        }
                    />
                    <div>
                        <div className="font-medium text-slate-900">24-Hour Reminder</div>
                        <div className="text-sm text-slate-600">
                            Send reminder email 24 hours before reservation
                        </div>
                    </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.send2hReminder}
                        onChange={(e) =>
                            setFormData({ ...formData, send2hReminder: e.target.checked })
                        }
                    />
                    <div>
                        <div className="font-medium text-slate-900">2-Hour Reminder</div>
                        <div className="text-sm text-slate-600">
                            Send reminder email 2 hours before reservation
                        </div>
                    </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.sendReviewRequest}
                        onChange={(e) =>
                            setFormData({ ...formData, sendReviewRequest: e.target.checked })
                        }
                    />
                    <div>
                        <div className="font-medium text-slate-900">Review Request</div>
                        <div className="text-sm text-slate-600">
                            Send review request after visit
                        </div>
                    </div>
                </label>

                {formData.sendReviewRequest && (
                    <div className="ml-6 space-y-2">
                        <label className="block text-sm font-medium text-slate-900">
                            Send review request after (hours)
                        </label>
                        <Input
                            type="number"
                            min="1"
                            max="168"
                            value={formData.reviewRequestDelay}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    reviewRequestDelay: parseInt(e.target.value) || 24,
                                })
                            }
                            className="max-w-xs"
                        />
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="gap-2">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Settings
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
