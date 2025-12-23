'use client';

import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ServicePeriod {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    maxCoversPerSlot: number;
    intervalMinutes: number;
}

interface SimpleCapacityInfoProps {
    servicePeriods: ServicePeriod[];
}

export function SimpleCapacityInfo({ servicePeriods }: SimpleCapacityInfoProps) {
    return (
        <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <h4 className="font-semibold mb-1">Simple Capacity Mode</h4>
                    <p className="text-sm text-muted-foreground">
                        You're using simple capacity management. Set the maximum number of covers per time slot in each service period above.
                    </p>
                </div>
            </div>

            {servicePeriods.length > 0 && (
                <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium">Current Service Period Capacities:</p>
                    {servicePeriods.map((period) => (
                        <div
                            key={period.id}
                            className="flex justify-between items-center py-2 px-3 bg-muted rounded-md"
                        >
                            <div>
                                <div className="font-medium">{period.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {period.startTime} - {period.endTime}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-lg">{period.maxCoversPerSlot}</div>
                                <div className="text-xs text-muted-foreground">covers per slot</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
