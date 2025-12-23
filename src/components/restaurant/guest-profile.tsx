"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateGuestPreferences, createGuestNote } from "@/actions/guests";
import { toast } from "@/components/ui/toast";
import {
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    TrendingUp,
    CheckCircle,
    XCircle,
    Ban,
    Star,
    StickyNote,
    Edit,
} from "lucide-react";
import { format } from "date-fns";

interface GuestProfileProps {
    guest: any;
    metrics: any;
}

export function GuestProfile({ guest, metrics }: GuestProfileProps) {
    const [isEditingPreferences, setIsEditingPreferences] = useState(false);
    const [preferences, setPreferences] = useState({
        dietaryRestrictions: guest.dietaryRestrictions || [],
        allergies: guest.allergies || [],
    });
    const [newNote, setNewNote] = useState("");
    const [isAddingNote, setIsAddingNote] = useState(false);

    const handleSavePreferences = async () => {
        try {
            await updateGuestPreferences(guest.id, preferences);
            setIsEditingPreferences(false);
            toast({
                title: "Preferences updated",
                description: "Guest preferences have been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update preferences.",
                variant: "destructive",
            });
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsAddingNote(true);
        try {
            await createGuestNote(guest.id, newNote);
            setNewNote("");
            toast({
                title: "Note added",
                description: "Staff note has been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add note.",
                variant: "destructive",
            });
        } finally {
            setIsAddingNote(false);
        }
    };

    const reliabilityColor =
        parseFloat(metrics.reliabilityScore) >= 80
            ? "text-green-600"
            : parseFloat(metrics.reliabilityScore) >= 60
                ? "text-yellow-600"
                : "text-red-600";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {guest.firstName[0]}
                            {guest.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {guest.firstName} {guest.lastName}
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {guest.email}
                                </div>
                                {guest.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {guest.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`text-3xl font-bold ${reliabilityColor}`}>
                            {metrics.reliabilityScore}%
                        </div>
                        <div className="text-sm text-slate-600">Reliability Score</div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Total Visits</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{metrics.totalBookings}</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {metrics.completedBookings}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Total Spent</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        ${metrics.totalSpent.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Avg Spend</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        ${metrics.averageSpend.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Preferences & Dietary Info</h2>
                    <Button
                        onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        {isEditingPreferences ? "Cancel" : "Edit"}
                    </Button>
                </div>

                {isEditingPreferences ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Dietary Restrictions
                            </label>
                            <Input
                                value={preferences.dietaryRestrictions.join(", ")}
                                onChange={(e) =>
                                    setPreferences({
                                        ...preferences,
                                        dietaryRestrictions: e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean),
                                    })
                                }
                                placeholder="Vegetarian, Vegan, Gluten-free..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Allergies
                            </label>
                            <Input
                                value={preferences.allergies.join(", ")}
                                onChange={(e) =>
                                    setPreferences({
                                        ...preferences,
                                        allergies: e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean),
                                    })
                                }
                                placeholder="Nuts, Shellfish, Dairy..."
                            />
                        </div>

                        <Button onClick={handleSavePreferences}>Save Preferences</Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {preferences.dietaryRestrictions.length > 0 && (
                            <div>
                                <span className="text-sm font-medium text-slate-700">
                                    Dietary Restrictions:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {preferences.dietaryRestrictions.map((restriction: string) => (
                                        <span
                                            key={restriction}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                        >
                                            {restriction}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preferences.allergies.length > 0 && (
                            <div>
                                <span className="text-sm font-medium text-slate-700">Allergies:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {preferences.allergies.map((allergy: string) => (
                                        <span
                                            key={allergy}
                                            className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                                        >
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preferences.dietaryRestrictions.length === 0 &&
                            preferences.allergies.length === 0 && (
                                <p className="text-sm text-slate-600">No preferences recorded</p>
                            )}
                    </div>
                )}
            </div>

            {/* Staff Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Staff Notes (Private)
                </h2>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a private note about this guest..."
                            rows={3}
                        />
                        <Button
                            onClick={handleAddNote}
                            disabled={!newNote.trim() || isAddingNote}
                            className="shrink-0"
                        >
                            {isAddingNote ? "Adding..." : "Add Note"}
                        </Button>
                    </div>

                    {guest.preferences?.notes && guest.preferences.notes.length > 0 && (
                        <div className="space-y-2">
                            {guest.preferences.notes.map((note: any, index: number) => (
                                <div key={index} className="bg-slate-50 p-3 rounded">
                                    <p className="text-sm text-slate-900">{note.text}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking History</h2>

                <div className="space-y-3">
                    {guest.bookings.map((booking: any) => (
                        <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 border border-slate-200 rounded"
                        >
                            <div>
                                <div className="font-medium text-slate-900">
                                    {format(new Date(booking.instance.startTime), "MMM d, yyyy")}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {booking.partySize} guests • ${Number(booking.totalAmount).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "COMPLETED"
                                            ? "bg-green-100 text-green-700"
                                            : booking.status === "NO_SHOW"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    ))}

                    {guest.bookings.length === 0 && (
                        <p className="text-sm text-slate-600 text-center py-4">No booking history</p>
                    )}
                </div>
            </div>
        </div>
    );
}
