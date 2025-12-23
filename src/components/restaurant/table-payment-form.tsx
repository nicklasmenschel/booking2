"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { DollarSign, Users, CreditCard, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface TablePaymentFormProps {
    restaurantId: string;
    tableId: string;
    booking: any;
}

export function TablePaymentForm({ restaurantId, tableId, booking }: TablePaymentFormProps) {
    const [splitCount, setSplitCount] = useState(1);
    const [tipPercentage, setTipPercentage] = useState(18);
    const [customTip, setCustomTip] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const baseAmount = Number(booking.totalAmount);
    const tipAmount =
        customTip !== ""
            ? parseFloat(customTip) || 0
            : (baseAmount * tipPercentage) / 100;
    const totalWithTip = baseAmount + tipAmount;
    const amountPerPerson = totalWithTip / splitCount;

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // In a real implementation, this would:
            // 1. Create a Stripe PaymentIntent for the amount
            // 2. Open Stripe payment UI
            // 3. Process the payment
            // 4. Update booking status to COMPLETED
            // 5. Trigger check-out workflow

            // For now, just show success
            toast({
                title: "Payment Successful!",
                description: `Paid $${amountPerPerson.toFixed(2)} per person`,
            });

            // Redirect to thank you page after 2 seconds
            setTimeout(() => {
                window.location.href = `/restaurant/${restaurantId}/thank-you`;
            }, 2000);
        } catch (error) {
            toast({
                title: "Payment Failed",
                description: "Please try again or see your server.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Bill Summary */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">${baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tip ({tipPercentage}%)</span>
                    <span className="font-medium">${tipAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-lg">${totalWithTip.toFixed(2)}</span>
                </div>
            </div>

            {/* Tip Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                    Select Tip
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {[15, 18, 20, 25].map((percent) => (
                        <button
                            key={percent}
                            onClick={() => {
                                setTipPercentage(percent);
                                setCustomTip("");
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${tipPercentage === percent && customTip === ""
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            {percent}%
                        </button>
                    ))}
                </div>
                <div className="mt-2">
                    <Input
                        type="number"
                        placeholder="Custom tip amount"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Split Payment */}
            <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                    Split Payment
                </label>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                        variant="outline"
                        size="sm"
                        disabled={splitCount <= 1}
                    >
                        -
                    </Button>
                    <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Users className="h-4 w-4 text-slate-600" />
                            <span className="font-medium">{splitCount} person(s)</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                        variant="outline"
                        size="sm"
                        disabled={splitCount >= 20}
                    >
                        +
                    </Button>
                </div>

                {splitCount > 1 && (
                    <div className="mt-2 text-center bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            ${amountPerPerson.toFixed(2)} per person
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                    Payment Method
                </label>
                <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <div className="text-left">
                                <div className="font-medium text-blue-900">Credit/Debit Card</div>
                                <div className="text-xs text-blue-700">
                                    Visa, Mastercard, Amex
                                </div>
                            </div>
                        </div>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 bg-black rounded text-white text-xs flex items-center justify-center font-bold">
                                A
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-slate-900">Apple Pay</div>
                                <div className="text-xs text-slate-600">Quick & secure</div>
                            </div>
                        </div>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 bg-gradient-to-r from-blue-500 to-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
                                G
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-slate-900">Google Pay</div>
                                <div className="text-xs text-slate-600">Quick & secure</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Pay Button */}
            <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <DollarSign className="h-5 w-5" />
                        Pay ${amountPerPerson.toFixed(2)}
                        {splitCount > 1 && " per person"}
                    </>
                )}
            </Button>

            <p className="text-xs text-center text-slate-500">
                Secure payment powered by Stripe
            </p>
        </div>
    );
}
