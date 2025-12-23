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
import { Modal } from "@/components/ui/dialog";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Store,
    Image as ImageIcon,
    FileText,
    Users,
    Sparkles,
    Loader2,
    LogIn,
    Upload,
    X
} from "lucide-react";

interface FormData {
    name: string;
    tagline: string;
    description: string;
    address: string;
    city: string;
    state: string;
    coverImage: string;
    capacity: number;
    basePrice: number;
}

const initialFormData: FormData = {
    name: "",
    tagline: "",
    description: "",
    address: "",
    city: "",
    state: "",
    coverImage: "",
    capacity: 50,
    basePrice: 30,
};

const steps = [
    { id: 1, name: "Basics", icon: Store },
    { id: 2, name: "Location", icon: MapPin },
    { id: 3, name: "Photos", icon: ImageIcon },
    { id: 4, name: "Description", icon: FileText },
    { id: 5, name: "Details", icon: Users },
];

export default function CreateServicePage() {
    const router = useRouter();
    const { userId, isLoaded } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Persist form data to sessionStorage
    useEffect(() => {
        if (formData.name) {
            sessionStorage.setItem('serviceFormData', JSON.stringify(formData));
        }
    }, [formData]);

    // Restore form data on mount
    useEffect(() => {
        const savedData = sessionStorage.getItem('serviceFormData');
        if (savedData) {
            try {
                setFormData(JSON.parse(savedData));
            } catch (e) {
                // Invalid data, ignore
            }
        }
    }, []);

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.name.trim().length >= 3;
            case 2:
                return formData.address && formData.city;
            case 3:
                return true; // Cover image optional
            case 4:
                return formData.description.length >= 20;
            case 5:
                return formData.capacity >= 1 && formData.basePrice >= 0;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (currentStep < 5 && canProceed()) {
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

        // Check auth at submit time
        if (!isLoaded) {
            toast.error("Please wait...");
            return;
        }

        if (!userId) {
            setShowAuthModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const coverImage = formData.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";

            const result = await createOffering({
                name: formData.name,
                tagline: formData.tagline || undefined,
                description: formData.description,
                category: "Restaurant",
                type: "RESTAURANT",
                isVirtual: false,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                coverImage,
                capacity: formData.capacity,
                basePrice: formData.basePrice,
                currency: "USD",
                date: new Date().toISOString().split('T')[0],
                startTime: "09:00",
                endTime: "22:00",
            });

            if (result.success && result.data) {
                await publishOffering(result.data.id);
                sessionStorage.removeItem('serviceFormData');

                toast.success("Service created!", {
                    description: "Let's set up your dashboard.",
                });

                router.push(`/dashboard/restaurant/${result.data.id}`);
            } else {
                throw new Error(result.error || "Failed to create service");
            }
        } catch (error) {
            toast.error("Failed to create service", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && canProceed()) {
            if (currentStep < 5) {
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
                        onClick={() => router.push('/create')}
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
                                        ? "bg-purple-600"
                                        : step.id < currentStep
                                            ? "bg-purple-400"
                                            : "bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="w-16" />
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
                                <StepBasics
                                    name={formData.name}
                                    tagline={formData.tagline}
                                    onNameChange={(v) => updateField("name", v)}
                                    onTaglineChange={(v) => updateField("tagline", v)}
                                />
                            )}
                            {currentStep === 2 && (
                                <StepLocation
                                    address={formData.address}
                                    city={formData.city}
                                    state={formData.state}
                                    onAddressChange={(v) => updateField("address", v)}
                                    onCityChange={(v) => updateField("city", v)}
                                    onStateChange={(v) => updateField("state", v)}
                                />
                            )}
                            {currentStep === 3 && (
                                <StepPhotos
                                    coverImage={formData.coverImage}
                                    onCoverChange={(v) => updateField("coverImage", v)}
                                />
                            )}
                            {currentStep === 4 && (
                                <StepDescription
                                    value={formData.description}
                                    onChange={(v) => updateField("description", v)}
                                />
                            )}
                            {currentStep === 5 && (
                                <StepDetails
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

                    {currentStep < 5 ? (
                        <Button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Service
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </footer>

            {/* Auth Modal */}
            <Modal open={showAuthModal} onClose={() => setShowAuthModal(false)} className="max-w-md">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <LogIn className="h-7 w-7 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold">Sign in to continue</h2>
                        <p className="text-muted-foreground mt-2">
                            You need to sign in to create your service. Don't worry - your progress has been saved!
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            size="lg"
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => router.push('/sign-in?redirect_url=/create/service')}
                        >
                            Sign in to continue
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowAuthModal(false)}
                        >
                            Keep editing
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <button
                            onClick={() => router.push('/sign-up?redirect_url=/create/service')}
                            className="text-purple-600 hover:underline font-medium"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </Modal>
        </div>
    );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepBasics({
    name,
    tagline,
    onNameChange,
    onTaglineChange,
}: {
    name: string;
    tagline: string;
    onNameChange: (v: string) => void;
    onTaglineChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Store className="h-7 w-7 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold">Name your service</h1>
                <p className="mt-2 text-muted-foreground">
                    What should guests call it?
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Service Name *</label>
                    <Input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g. Bella Italia, Sunday Supper Club"
                        className="text-lg h-12"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">
                        Tagline (optional)
                        <span className="text-xs text-muted-foreground ml-2">100 characters max</span>
                    </label>
                    <Input
                        value={tagline}
                        onChange={(e) => onTaglineChange(e.target.value)}
                        placeholder="Authentic Italian cuisine in a cozy setting"
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

function StepLocation({
    address,
    city,
    state,
    onAddressChange,
    onCityChange,
    onStateChange,
}: {
    address: string;
    city: string;
    state: string;
    onAddressChange: (v: string) => void;
    onCityChange: (v: string) => void;
    onStateChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold">Where is it?</h1>
                <p className="mt-2 text-muted-foreground">
                    Your service location
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Address *</label>
                    <Input
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        placeholder="123 Main Street"
                        className="h-12"
                        autoFocus
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">City *</label>
                        <Input
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                            placeholder="San Francisco"
                            className="h-12"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">State</label>
                        <Input
                            value={state}
                            onChange={(e) => onStateChange(e.target.value)}
                            placeholder="CA"
                            className="h-12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepPhotos({
    coverImage,
    onCoverChange,
}: {
    coverImage: string;
    onCoverChange: (v: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-7 w-7 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold">Add a cover photo</h1>
                <p className="mt-2 text-muted-foreground">
                    First impressions matter
                </p>
            </div>

            <div className="space-y-4">
                {coverImage ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                        <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => onCoverChange("")}
                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop or paste an image URL
                        </p>
                        <Input
                            placeholder="https://example.com/image.jpg"
                            onChange={(e) => onCoverChange(e.target.value)}
                            className="max-w-sm mx-auto"
                        />
                    </div>
                )}

                <p className="text-center text-sm text-muted-foreground">
                    Skip for now — you can add photos later
                </p>
            </div>
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
                <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold">Describe your service</h1>
                <p className="mt-2 text-muted-foreground">
                    What makes it special?
                </p>
            </div>

            <div>
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Tell guests about your cuisine, atmosphere, and what makes dining with you special..."
                    className="min-h-[160px] text-base"
                    autoFocus
                />
                <p className={`text-xs mt-2 ${value.length >= 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {value.length}/20 characters minimum {value.length >= 20 && '✓'}
                </p>
            </div>
        </div>
    );
}

function StepDetails({
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
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold">Final details</h1>
                <p className="mt-2 text-muted-foreground">
                    Capacity and pricing
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Total Capacity</label>
                    <Input
                        type="number"
                        value={capacity}
                        onChange={(e) => onCapacityChange(parseInt(e.target.value) || 1)}
                        min={1}
                        className="h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Maximum guests you can serve at once
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium mb-2 block">Average Spend ($)</label>
                    <Input
                        type="number"
                        value={basePrice}
                        onChange={(e) => onPriceChange(parseInt(e.target.value) || 0)}
                        min={0}
                        className="h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Typical cost per person
                    </p>
                </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-medium text-purple-900 mb-2">What happens next?</h3>
                <p className="text-sm text-purple-700">
                    After creating your service, you'll set up service periods (lunch, dinner),
                    tables, and start accepting reservations from your dashboard.
                </p>
            </div>
        </div>
    );
}
