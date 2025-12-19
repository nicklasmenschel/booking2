'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createServicePeriod, deleteServicePeriod } from '@/actions/restaurant';
import { toast } from 'sonner';
import { Plus, Trash2, Clock } from 'lucide-react';

interface ServicePeriod {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    lastSeating: string;
    daysOfWeek: number[];
    intervalMinutes: number;
    maxCoversPerSlot: number;
    isActive: boolean;
}

interface ServicePeriodConfigProps {
    offeringId: string;
    initialPeriods: ServicePeriod[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ServicePeriodConfig({
    offeringId,
    initialPeriods,
}: ServicePeriodConfigProps) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('11:00');
    const [endTime, setEndTime] = useState('22:00');
    const [lastSeating, setLastSeating] = useState('21:30');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [interval, setInterval] = useState(30);
    const [maxCovers, setMaxCovers] = useState(20);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleDay = (day: number) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || selectedDays.length === 0) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        const result = await createServicePeriod({
            offeringId,
            name,
            startTime,
            endTime,
            lastSeating,
            daysOfWeek: selectedDays,
            intervalMinutes: interval,
            maxCoversPerSlot: maxCovers,
        });

        if (result.success) {
            toast.success('Service period created');
            setShowForm(false);
            setName('');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to create service period');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (periodId: string) => {
        if (!confirm('Delete this service period?')) return;

        const result = await deleteServicePeriod(periodId);
        if (result.success) {
            toast.success('Service period deleted');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            {/* Existing Periods */}
            {initialPeriods.length > 0 && (
                <div className="space-y-3">
                    {initialPeriods.map((period) => (
                        <Card key={period.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">{period.name}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Hours</p>
                                            <p className="font-medium">
                                                {period.startTime} - {period.endTime}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Last seating: {period.lastSeating}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Days</p>
                                            <p className="font-medium">
                                                {period.daysOfWeek.map((d) => DAYS[d - 1]).join(', ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Interval</p>
                                            <p className="font-medium">{period.intervalMinutes} min</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Max Covers/Slot</p>
                                            <p className="font-medium">{period.maxCoversPerSlot}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(period.id)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add New Period */}
            {!showForm ? (
                <Button onClick={() => setShowForm(true)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Period
                </Button>
            ) : (
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Lunch, Dinner, Brunch"
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Last Seating
                                </label>
                                <input
                                    type="time"
                                    value={lastSeating}
                                    onChange={(e) => setLastSeating(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Days of Week</label>
                            <div className="flex gap-2">
                                {DAYS.map((day, index) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(index + 1)}
                                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${selectedDays.includes(index + 1)
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Interval (minutes)
                                </label>
                                <select
                                    value={interval}
                                    onChange={(e) => setInterval(Number(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value={15}>15 min</option>
                                    <option value={30}>30 min</option>
                                    <option value={45}>45 min</option>
                                    <option value={60}>60 min</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Max Covers per Slot
                                </label>
                                <input
                                    type="number"
                                    value={maxCovers}
                                    onChange={(e) => setMaxCovers(Number(e.target.value))}
                                    min={1}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? 'Creating...' : 'Create Service Period'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
}
