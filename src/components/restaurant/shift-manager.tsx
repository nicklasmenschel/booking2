"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Clock, Plus, Trash2 } from "lucide-react";
import { createShift, deleteShift } from "@/actions/shifts";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    intervalMinutes: number;
    maxCoversPerSlot: number;
}

interface ShiftManagerProps {
    offeringId: string;
    initialShifts: Shift[];
}

export function ShiftManager({ offeringId, initialShifts }: ShiftManagerProps) {
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        startTime: "17:00",
        endTime: "22:00",
        daysOfWeek: [] as number[],
        intervalMinutes: "15",
        maxCoversPerSlot: "20",
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const toggleDay = (index: number) => {
        setFormData(prev => {
            if (prev.daysOfWeek.includes(index)) {
                return { ...prev, daysOfWeek: prev.daysOfWeek.filter(d => d !== index) };
            } else {
                return { ...prev, daysOfWeek: [...prev.daysOfWeek, index].sort() };
            }
        });
    };

    const handleCreate = async () => {
        if (!formData.name || formData.daysOfWeek.length === 0) {
            toast.error("Please fill in all required fields (Name and Days)");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createShift({
                offeringId,
                name: formData.name,
                startTime: formData.startTime,
                endTime: formData.endTime,
                lastSeating: formData.endTime, // simplified
                daysOfWeek: formData.daysOfWeek,
                intervalMinutes: parseInt(formData.intervalMinutes),
                maxCoversPerSlot: parseInt(formData.maxCoversPerSlot),
            });

            if (result.success) {
                toast.success("Shift created");
                setIsDialogOpen(false);
                setFormData({
                    name: "",
                    startTime: "17:00",
                    endTime: "22:00",
                    daysOfWeek: [],
                    intervalMinutes: "15",
                    maxCoversPerSlot: "20",
                });
                window.location.reload();
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error("Failed to create shift");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this shift?")) return;
        try {
            const result = await deleteShift(id);
            if (result.success) {
                toast.success("Shift deleted");
                window.location.reload();
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error("Failed to delete shift");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Service Periods ({shifts.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Shift
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Shift</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Shift Name</label>
                                <Input
                                    placeholder="e.g. Dinner Service"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Time</label>
                                    <Input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Time</label>
                                    <Input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium block">Days Active</label>
                                <div className="flex flex-wrap gap-2">
                                    {days.map((day, i) => (
                                        <Badge
                                            key={day}
                                            variant={formData.daysOfWeek.includes(i) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleDay(i)}
                                        >
                                            {day}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Interval (min)</label>
                                    <Select
                                        value={formData.intervalMinutes}
                                        onValueChange={(val) => setFormData({ ...formData, intervalMinutes: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 mins</SelectItem>
                                            <SelectItem value="30">30 mins</SelectItem>
                                            <SelectItem value="60">60 mins</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Max Covers / Slot</label>
                                    <Input
                                        type="number"
                                        value={formData.maxCoversPerSlot}
                                        onChange={(e) => setFormData({ ...formData, maxCoversPerSlot: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleCreate} disabled={isLoading} className="w-full">
                                {isLoading ? "Creating..." : "Create Shift"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {shifts.map((shift) => (
                    <Card key={shift.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{shift.name}</h3>
                                <div className="flex gap-1">
                                    {shift.daysOfWeek.sort().map(d => (
                                        <Badge key={d} variant="secondary" className="text-xs px-1">
                                            {days[d]}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {shift.startTime} - {shift.endTime}
                                </span>
                                <span>•</span>
                                <span>{shift.intervalMinutes}m intervals</span>
                                <span>•</span>
                                <span>Max {shift.maxCoversPerSlot} covers</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(shift.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </Card>
                ))}
            </div>

            {shifts.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No service periods configured.</p>
                </div>
            )}
        </div>
    );
}
