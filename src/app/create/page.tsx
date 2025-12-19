"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

type EventType = "ONE_TIME" | "RECURRING" | "RESTAURANT";

interface FormData {
    // Step 1: Name
    name: string;
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
    type: "ONE_TIME",
    date: "",
    startTime: "19:00",
    endTime: "21:00",
    isVirtual: false,
    address: "",
    city: "",
    state: "",
    virtualUrl: "",
    coverImage: "",
    images: [],
    description: "",
    capacity: 20,
    basePrice: 50,
};

const steps = [
    { id: 1, title: "Name", icon: FileText },
    { id: 2, title: "When", icon: Calendar },
    { id: 3, title: "Where", icon: MapPin },
    { id: 4, title: "Photos", icon: ImageIcon },
    { id: 5, title: "Description", icon: FileText },
    { id: 6, title: "Price", icon: DollarSign },
];

export default function CreatePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.name.trim().length >= 3;
            case 2:
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
                currency: "USD",
                recurrence: formData.type === "RECURRING" && formData.recurrence ? {
                    ...formData.recurrence,
                    until: formData.recurrence.until ? new Date(formData.recurrence.until) : undefined
                } : undefined
            });

            if (result.success && result.data) {
                // Publish immediately
                await publishOffering(result.data.id);

                toast.success("Your event is live!", {
                    description: "Share the link to start getting bookings.",
                });

                router.push(`/e/${result.data.slug}`);
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
                                        ? "bg-accent-500"
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
                                    value={formData.name}
                                    onChange={(v) => updateField("name", v)}
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
    value,
    onChange
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">What's the name of your event?</h1>
                <p className="mt-2 text-muted-foreground">
                    Make it catchy and memorable
                </p>
            </div>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Thursday Wine Night"
                className="text-xl h-14 text-center"
                autoFocus
            />
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

            {/* Event Type Selection */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { value: "ONE_TIME", label: "One-time" },
                    { value: "RECURRING", label: "Recurring" },
                    { value: "RESTAURANT", label: "Restaurant" },
                ].map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onTypeChange(option.value as EventType)}
                        className={`p-4 rounded-xl border-2 transition-all ${type === option.value
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/50"
                            }`}
                    >
                        <span className="font-medium">{option.label}</span>
                    </button>
                ))}
            </div>

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

            {type === "RECURRING" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="p-4 rounded-xl bg-accent/50 border border-accent space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Repeats</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={recurrence?.frequency || "WEEKLY"}
                                    onChange={(e) => onRecurrenceChange({
                                        interval: 1,
                                        ...recurrence,
                                        frequency: e.target.value as any
                                    })}
                                >
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Every</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={recurrence?.interval || 1}
                                        onChange={(e) => onRecurrenceChange({
                                            frequency: "WEEKLY",
                                            ...recurrence,
                                            interval: parseInt(e.target.value) || 1
                                        })}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {(recurrence?.frequency || "WEEKLY").toLowerCase().replace("ly", "s")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Weekday Selector for Weekly */}
                        {(recurrence?.frequency === "WEEKLY" || !recurrence?.frequency) && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Repeat on</label>
                                <div className="flex gap-2 justify-between">
                                    {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => {
                                        const isSelected = recurrence?.byWeekDay?.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    const current = recurrence?.byWeekDay || [];
                                                    const updated = isSelected
                                                        ? current.filter(d => d !== day)
                                                        : [...current, day];
                                                    onRecurrenceChange({
                                                        frequency: "WEEKLY",
                                                        interval: 1,
                                                        ...recurrence,
                                                        byWeekDay: updated
                                                    });
                                                }}
                                                className={`h-10 w-10 index flex items-center justify-center rounded-full text-xs font-medium transition-colors ${isSelected
                                                    ? "bg-foreground text-background"
                                                    : "bg-muted hover:bg-muted/80"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ends on</label>
                            <Input
                                type="date"
                                value={recurrence?.until || ""}
                                onChange={(e) => onRecurrenceChange({
                                    frequency: "WEEKLY",
                                    interval: 1,
                                    ...recurrence,
                                    until: e.target.value
                                })}
                            />
                            <p className="text-xs text-muted-foreground">Leave blank to never end (limit 3 months generated)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            label="Start Date"
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
                </div>
            )}

            {type === "RESTAURANT" && (
                <div className="p-4 rounded-xl bg-muted text-center">
                    <p className="text-muted-foreground">
                        Restaurant mode coming soon! For now, create a one-time event.
                    </p>
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
