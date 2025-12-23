"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createOffering, publishOffering } from "@/actions/offerings";
import { toast } from "@/components/ui/toast";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    MapPin,
    Image as ImageIcon,
    FileText,
    Users,
    DollarSign,
    Sparkles,
    Check,
    Loader2
} from "lucide-react";

type EventType = "ONE_TIME";

interface FormData {
    // Step 1: Name
    name: string;
    tagline: string;
    category: string;
    // Step 2: When
    type: EventType;
    date: string;
    startTime: string;
    endTime: string;
    // Step 3: Where
    isVirtual: boolean;
    address: string;
    city: string;
    state: string;
    virtualUrl: string;
    // Step 4: Photos
    coverImage: string;
    images: string[];
    // Step 5: Description
    description: string;
    // Step 6: Capacity & Price
    capacity: number;
    basePrice: number;
    // Recurrence
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
        interval: number;
        until?: string;
        byWeekDay?: string[];
        count?: number;
    };
}

const initialFormData: FormData = {
    name: "",
    tagline: "",
    category: "",
    type: "ONE_TIME",
    date: "",
    startTime: "",
    endTime: "",
    isVirtual: false,
    address: "",
    city: "",
    state: "",
    virtualUrl: "",
    coverImage: "",
    images: [],
    description: "",
    capacity: 10,
    price: 0,
    requirements: "",
    whatToBring: "",
    cancellationPolicy: "",
    isRecurring: false,
    recurrencePattern: "WEEKLY",
    recurrenceDays: [],
    recurrenceEndDate: "",
};

const steps = [
    { id: 1, name: "Type", icon: Sparkles },
    { id: 2, name: "Name", icon: FileText },
    { id: 3, name: "When", icon: Calendar },
    { id: 4, name: "Where", icon: MapPin },
    { id: 5, name: "Photos", icon: ImageIcon },
    { id: 6, name: "Description", icon: FileText },
    { id: 7, name: "Details", icon: Users },
];

export default function CreatePage() {
    const router = useRouter();
    const { userId, isLoaded } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offeringType, setOfferingType] = useState<"EVENT" | "RESTAURANT">("EVENT");

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push("/sign-in?redirect_url=/create");
        }
    }, [isLoaded, userId, router]);

    // Show loading state while checking auth
    if (!isLoaded || !userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-600" />
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }


    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.name.trim().length >= 3 && formData.category.length > 0;
            case 2:
                // One-time events need specific date and time
                return formData.date && formData.startTime;
            case 3:
                return formData.isVirtual ? formData.virtualUrl : formData.address;
            case 4:
                return formData.coverImage || true; // Optional for now
            case 5:
                return formData.description.length >= 20;
            case 6:
                return formData.capacity >= 1 && formData.basePrice >= 0;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (currentStep < 6 && canProceed()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;

        setIsSubmitting(true);

        try {
            // For demo purposes, use a placeholder image if none provided
            const coverImage = formData.coverImage || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800";

            const result = await createOffering({
                name: formData.name,
                tagline: formData.tagline || undefined,
                category: formData.category || undefined,
                description: formData.description,
                coverImage,
                images: formData.images,
                type: formData.type,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                isVirtual: formData.isVirtual,
                address: formData.isVirtual ? undefined : formData.address,
                city: formData.city,
                state: formData.state,
                virtualUrl: formData.isVirtual ? formData.virtualUrl : undefined,
                capacity: formData.capacity,
                basePrice: formData.basePrice,
                currency: "USD"
            });

            if (result.success && result.data) {
                // Publish immediately
                const publishResult = await publishOffering(result.data.id);

                if (publishResult.success) {
                    toast.success("Your event is live!", {
                        description: "Share the link to start getting bookings.",
                    });

                    router.push(`/e/${result.data.slug}`);
                } else {
                    // Publish failed, likely due to no instances
                    throw new Error(publishResult.error || "Event created but failed to publish");
                }
            } else {
                throw new Error(result.error || "Failed to create event");
            }
        } catch (error) {
            toast.error("Failed to create event", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && canProceed()) {
            if (currentStep < 6) {
                nextStep();
            } else {
                handleSubmit();
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border">
                <div className="container flex h-16 items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm">Back</span>
                    </button>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`h-2 w-8 rounded-full transition-colors ${step.id === currentStep
                                    ? "bg-foreground"
                                    : step.id < currentStep
                                        ? "bg-[#C9A76B]-500"
                                        : "bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="w-16" /> {/* Spacer */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            onKeyDown={handleKeyDown}
                        >
                            {currentStep === 1 && (
                                <StepName
                                    name={formData.name}
                                    tagline={formData.tagline}
                                    category={formData.category}
                                    onNameChange={(v) => updateField("name", v)}
                                    onTaglineChange={(v) => updateField("tagline", v)}
                                    onCategoryChange={(v) => updateField("category", v)}
                                />
                            )}
                            {currentStep === 2 && (
                                <StepWhen
                                    type={formData.type}
                                    date={formData.date}
                                    startTime={formData.startTime}
                                    endTime={formData.endTime}
                                    onTypeChange={(v) => updateField("type", v)}
                                    onDateChange={(v) => updateField("date", v)}
                                    onStartTimeChange={(v) => updateField("startTime", v)}
                                    onEndTimeChange={(v) => updateField("endTime", v)}
                                    recurrence={formData.recurrence}
                                    onRecurrenceChange={(v) => updateField("recurrence", v)}
                                />
                            )}
                            {currentStep === 3 && (
                                <StepWhere
                                    isVirtual={formData.isVirtual}
                                    address={formData.address}
                                    city={formData.city}
                                    state={formData.state}
                                    virtualUrl={formData.virtualUrl}
                                    onVirtualChange={(v) => updateField("isVirtual", v)}
                                    onAddressChange={(v) => updateField("address", v)}
                                    onCityChange={(v) => updateField("city", v)}
                                    onStateChange={(v) => updateField("state", v)}
                                    onVirtualUrlChange={(v) => updateField("virtualUrl", v)}
                                />
                            )}
                            {currentStep === 4 && (
                                <StepPhotos
                                    coverImage={formData.coverImage}
                                    images={formData.images}
                                    onCoverChange={(v) => updateField("coverImage", v)}
                                    onImagesChange={(v) => updateField("images", v)}
                                />
                            )}
                            {currentStep === 5 && (
                                <StepDescription
                                    value={formData.description}
                                    onChange={(v) => updateField("description", v)}
                                />
                            )}
                            {currentStep === 6 && (
                                <StepPrice
                                    capacity={formData.capacity}
                                    basePrice={formData.basePrice}
                                    onCapacityChange={(v) => updateField("capacity", v)}
                                    onPriceChange={(v) => updateField("basePrice", v)}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border">
                <div className="container flex h-20 items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    {currentStep < 6 ? (
                        <Button
                            onClick={nextStep}
                            disabled={!canProceed()}
                        >
                            Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Publish Event
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepName({
    name,
    tagline,
    category,
    onNameChange,
    onTaglineChange,
    onCategoryChange,
}: {
    name: string;
    tagline: string;
    category: string;
    onNameChange: (v: string) => void;
    onTaglineChange: (v: string) => void;
    onCategoryChange: (v: string) => void;
}) {
    const categories = [
        "Cooking Class",
        "Wine Tasting",
        "Concert",
        "Workshop",
        "Sports",
        "Fitness & Wellness",
        "Arts & Crafts",
        "Live Music",
        "Brunch",
        "Dinner Party",
        "Private Chef",
        "Other",
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Event Basics</h1>
                <p className="mt-2 text-muted-foreground">
                    Tell us about your event
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Event Name *</label>
                    <Input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Thursday Wine Night"
                        className="text-lg h-12"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <select
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Select a category...</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">
                        Tagline (optional)
                        <span className="text-xs text-muted-foreground ml-2">100 characters max</span>
                    </label>
                    <Input
                        value={tagline}
                        onChange={(e) => onTaglineChange(e.target.value)}
                        placeholder="Learn authentic Italian pasta"
                        className="h-12"
                        maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {tagline.length}/100 characters
                    </p>
                </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Press Enter to continue
            </p>
        </div>
    );
}

function StepWhen({
    type,
    date,
    startTime,
    endTime,
    onTypeChange,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange,
    recurrence,
    onRecurrenceChange,
}: {
    type: EventType;
    date: string;
    startTime: string;
    endTime: string;
    onTypeChange: (v: EventType) => void;
    onDateChange: (v: string) => void;
    onStartTimeChange: (v: string) => void;
    onEndTimeChange: (v: string) => void;
    recurrence?: FormData["recurrence"];
    onRecurrenceChange: (v: FormData["recurrence"]) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">When is it happening?</h1>
                <p className="mt-2 text-muted-foreground">
                    Pick a date and time
                </p>
            </div>

            {/* Event is always ONE_TIME, no selector needed */}

            {type === "ONE_TIME" && (
                <div className="space-y-4">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        label="Date"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => onStartTimeChange(e.target.value)}
                            label="Start time"
                        />
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => onEndTimeChange(e.target.value)}
                            label="End time"
                        />
                    </div>
                </div>
            )}




        </div>
    );
}

function StepWhere({
    isVirtual,
    address,
    city,
    state,
    virtualUrl,
    onVirtualChange,
    onAddressChange,
    onCityChange,
    onStateChange,
    onVirtualUrlChange,
}: {
    isVirtual: boolean;
    address: string;
    city: string;
    state: string;
    virtualUrl: string;
    onVirtualChange: (v: boolean) => void;
    onAddressChange: (v: string) => void;
    onCityChange: (v: string) => void;
    onStateChange: (v: string) => void;
    onVirtualUrlChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Where is it?</h1>
                <p className="mt-2 text-muted-foreground">
                    In-person or online
                </p>
            </div>

            {/* Virtual Toggle */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => onVirtualChange(false)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${!isVirtual
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/50"
                        }`}
                >
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">In-person</span>
                </button>
                <button
                    onClick={() => onVirtualChange(true)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isVirtual
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/50"
                        }`}
                >
                    <span className="text-xl">💻</span>
                    <span className="font-medium">Virtual</span>
                </button>
            </div>

            {!isVirtual ? (
                <div className="space-y-4">
                    <Input
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        placeholder="123 Main Street"
                        label="Address"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                            placeholder="San Francisco"
                            label="City"
                        />
                        <Input
                            value={state}
                            onChange={(e) => onStateChange(e.target.value)}
                            placeholder="CA"
                            label="State"
                        />
                    </div>
                </div>
            ) : (
                <Input
                    value={virtualUrl}
                    onChange={(e) => onVirtualUrlChange(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    label="Meeting link"
                    hint="Guests will see this after booking"
                />
            )}
        </div>
    );
}

function StepPhotos({
    coverImage,
    images,
    onCoverChange,
    onImagesChange,
}: {
    coverImage: string;
    images: string[];
    onCoverChange: (v: string) => void;
    onImagesChange: (v: string[]) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Add some photos</h1>
                <p className="mt-2 text-muted-foreground">
                    Show guests what to expect
                </p>
            </div>

            {/* Cover Image */}
            <div
                className="relative aspect-video rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors overflow-hidden"
                onClick={() => {
                    // TODO: Implement file upload
                    const url = prompt("Enter image URL (or use UploadThing):");
                    if (url) onCoverChange(url);
                }}
            >
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center p-6">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 font-medium">Add cover photo</p>
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    </div>
                )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
                You can skip this for now
            </p>
        </div>
    );
}

function StepDescription({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Tell guests what to expect</h1>
                <p className="mt-2 text-muted-foreground">
                    Describe the experience
                </p>
            </div>

            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Join us for an intimate evening of wine discovery. We'll taste 6 carefully selected wines from the Napa Valley, paired with artisan cheeses and charcuterie..."
                className="min-h-[200px]"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{value.length} characters</span>
                <span>{value.length >= 20 ? "✓ Looks good!" : "At least 20 characters"}</span>
            </div>
        </div>
    );
}

function StepPrice({
    capacity,
    basePrice,
    onCapacityChange,
    onPriceChange,
}: {
    capacity: number;
    basePrice: number;
    onCapacityChange: (v: number) => void;
    onPriceChange: (v: number) => void;
}) {
    const isFree = basePrice === 0;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Almost done!</h1>
                <p className="mt-2 text-muted-foreground">
                    Set your capacity and price
                </p>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
                <label className="text-sm font-medium">How many guests?</label>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onCapacityChange(Math.max(1, capacity - 1))}
                        className="h-12 w-12 rounded-xl border-2 border-border flex items-center justify-center text-xl hover:border-foreground transition-colors"
                    >
                        -
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-4xl font-bold">{capacity}</span>
                        <p className="text-sm text-muted-foreground">guests maximum</p>
                    </div>
                    <button
                        onClick={() => onCapacityChange(capacity + 1)}
                        className="h-12 w-12 rounded-xl border-2 border-border flex items-center justify-center text-xl hover:border-foreground transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Price per person</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                        $
                    </span>
                    <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => onPriceChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full h-14 pl-10 pr-4 text-2xl font-bold rounded-xl border-2 border-input focus:border-foreground outline-none transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPriceChange(0)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${isFree
                            ? "bg-foreground text-background"
                            : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        Free event
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{capacity} guests</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{isFree ? "Free" : `$${basePrice}/person`}</span>
                </div>
                {!isFree && (
                    <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">Potential revenue</span>
                        <span className="font-bold">${capacity * basePrice}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
