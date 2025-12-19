"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { createBooking } from "@/actions/bookings";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import { formatCurrency, formatDate, formatTime, isValidEmail } from "@/lib/utils";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    CreditCard,
    Lock,
    Loader2,
    Check,
    Sparkles
} from "lucide-react";

interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    offering: {
        id: string;
        name: string;
        basePrice: number;
        currency: string;
    };
    instance: {
        id: string;
        date: Date;
        startTime: Date;
        endTime: Date;
    };
    guestCount: number;
    unitPrice: number;
}

type Step = "info" | "payment" | "success";

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function BookingModal({
    open,
    onClose,
    offering,
    instance,
    guestCount,
    unitPrice,
}: BookingModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("info");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Booking result
    const [bookingNumber, setBookingNumber] = useState("");
    const [qrCode, setQrCode] = useState("");

    // Payment state
    const [clientSecret, setClientSecret] = useState("");

    // Pricing
    const baseAmount = unitPrice * guestCount;
    const taxAmount = 0; // TODO: Implement tax calculation
    const totalAmount = baseAmount + taxAmount;

    const tags = ["Vegetarian", "Birthday", "Anniversary", "First time", "Allergies"];

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const canProceedToPayment = name.trim() && isValidEmail(email);

    const handleSubmit = async () => {
        if (!canProceedToPayment) return;

        setIsSubmitting(true);

        try {
            const result = await createBooking({
                instanceId: instance.id,
                guestName: name,
                guestEmail: email,
                guestPhone: phone || undefined,
                guestCount,
                specialRequests: specialRequests || undefined,
                tags: selectedTags,
            });

            if (result.success && result.data && result.data.clientSecret) {
                setBookingNumber(result.data.bookingNumber);
                setQrCode(result.data.qrCode || "");
                setClientSecret(result.data.clientSecret);
                setStep("payment");
            } else {
                throw new Error(result.error || "Failed to initiate booking");
            }
        } catch (error) {
            toast.error("Booking failed", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (step === "success") {
            // Redirect to booking confirmation page
            router.push(`/booking/${bookingNumber}`);
        } else {
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={handleClose} className="max-w-md">
            <AnimatePresence mode="wait">
                {step === "info" && (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div>
                            <h2 className="text-xl font-bold">Your information</h2>
                            <p className="text-sm text-muted-foreground">
                                Enter your details to complete the booking
                            </p>
                        </div>

                        {/* Booking Summary */}
                        <div className="p-4 rounded-xl bg-muted space-y-2 text-sm">
                            <p className="font-medium">{offering.name}</p>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(instance.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatTime(instance.startTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {guestCount} {guestCount === 1 ? "guest" : "guests"}
                                </span>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <Input
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                autoFocus
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                hint="We'll send confirmation here"
                            />
                            <Input
                                label="Phone (optional)"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        {/* Special Requests Toggle */}
                        <div className="space-y-3">
                            <button
                                onClick={() => { }}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                + Add special requests
                            </button>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                                            ? "bg-foreground text-background"
                                            : "bg-muted hover:bg-muted/80"
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Special Requests Textarea */}
                            {selectedTags.length > 0 && (
                                <Textarea
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    placeholder="Any dietary restrictions, allergies, or special requests?"
                                    className="min-h-[80px]"
                                />
                            )}
                        </div>

                        {/* Continue Button */}
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!canProceedToPayment || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating booking...
                                </>
                            ) : (
                                "Continue to payment"
                            )}
                        </Button>
                    </motion.div>
                )}

                {step === "payment" && clientSecret && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setStep("info")}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>

                        <div>
                            <h2 className="text-xl font-bold">Payment</h2>
                            <p className="text-sm text-muted-foreground">Complete your booking</p>
                        </div>

                        {/* Price Breakdown */}
                        <div className="p-4 rounded-xl bg-muted space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {formatCurrency(unitPrice, offering.currency)} × {guestCount} guests
                                </span>
                                <span>{formatCurrency(baseAmount, offering.currency)}</span>
                            </div>
                            <div className="pt-3 border-t border-border flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(totalAmount, offering.currency)}</span>
                            </div>
                        </div>

                        {/* Stripe Elements */}
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <PaymentForm
                                email={email}
                                totalAmount={totalAmount}
                                currency={offering.currency}
                                onSuccess={() => setStep("success")}
                            />
                        </Elements>
                    </motion.div>
                )}

                {step === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        {/* Success Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                            <Check className="h-8 w-8 text-success" />
                        </div>

                        {/* Header */}
                        <div>
                            <h2 className="text-2xl font-bold">You're confirmed!</h2>
                            <p className="text-muted-foreground mt-1">
                                Booking #{bookingNumber}
                            </p>
                        </div>

                        {/* QR Code */}
                        {qrCode && (
                            <div className="flex justify-center">
                                <img
                                    src={qrCode}
                                    alt="Booking QR Code"
                                    className="w-32 h-32 rounded-xl"
                                />
                            </div>
                        )}

                        {/* Booking Details */}
                        <div className="p-4 rounded-xl bg-muted text-left space-y-2">
                            <p className="font-medium">{offering.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(instance.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatTime(instance.startTime)}
                                </span>
                            </div>
                            <p className="text-sm">
                                {guestCount} {guestCount === 1 ? "guest" : "guests"} • {formatCurrency(totalAmount, offering.currency)}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleClose}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                View your ticket
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Confirmation sent to {email}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
}

// Payment Form Component
function PaymentForm({
    email,
    totalAmount,
    currency,
    onSuccess
}: {
    email: string;
    totalAmount: number;
    currency: string;
    onSuccess: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/booking/confirmation",
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message ?? "An unexpected error occurred.");
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <LinkAuthenticationElement
                id="link-authentication-element"
                options={{ defaultValues: { email } }}
            />
            <PaymentElement
                id="payment-element"
                options={{ layout: "tabs" }}
            />

            {message && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                    {message}
                </div>
            )}

            <Button
                size="lg"
                className="w-full mt-4"
                disabled={isProcessing || !stripe || !elements}
                type="submit"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay ${formatCurrency(totalAmount, currency)}`
                )}
            </Button>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                <Lock className="h-3 w-3" />
                Secure payment by Stripe
            </p>
        </form>
    );
}
