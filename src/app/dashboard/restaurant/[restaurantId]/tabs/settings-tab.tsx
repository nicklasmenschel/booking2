"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ServicePeriodConfig } from "@/components/restaurant/service-period-config";
import { CapacityModeSelector } from "@/components/restaurant/capacity-mode-selector";
import { SimpleCapacityInfo } from "@/components/restaurant/simple-capacity-info";
import { TableManager } from "@/components/restaurant/table-manager";
import { Clock, Table2, Settings2 } from "lucide-react";

interface SettingsTabProps {
    offering: any;
    servicePeriods: any[];
    tables: any[];
}

export function SettingsTab({ offering, servicePeriods, tables }: SettingsTabProps) {
    // Default to table-based if tables exist, otherwise simple
    const [capacityMode, setCapacityMode] = useState<'table-based' | 'simple'>(
        tables.length > 0 ? 'table-based' : 'simple'
    );

    return (
        <div className="space-y-8">
            {/* Service Periods Section */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Service Periods</h3>
                        <p className="text-sm text-muted-foreground">
                            Configure your operating hours (lunch, dinner, brunch, etc.)
                        </p>
                    </div>
                </div>

                {servicePeriods.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-800">
                            <strong>⚠️ No service periods configured.</strong> Add at least one service period
                            to allow guests to make reservations.
                        </p>
                    </div>
                )}

                <ServicePeriodConfig
                    offeringId={offering.id}
                    initialPeriods={servicePeriods}
                />
            </div>

            {/* Capacity Mode Selection */}
            <CapacityModeSelector
                offeringId={offering.id}
                currentMode={capacityMode}
                onModeChange={setCapacityMode}
            />

            {/* Conditional Rendering Based on Mode */}
            {capacityMode === 'table-based' ? (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Table2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Tables & Seating</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage your restaurant's tables and track reservations
                            </p>
                        </div>
                    </div>
                    <TableManager offeringId={offering.id} initialTables={tables} />
                </div>
            ) : (
                <SimpleCapacityInfo servicePeriods={servicePeriods} />
            )}

            {/* Restaurant Info */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Settings2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Restaurant Details</h3>
                        <p className="text-sm text-muted-foreground">
                            Basic information
                        </p>
                    </div>
                </div>

                <Card className="p-4">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Name</dt>
                            <dd className="font-medium">{offering.name}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Total Capacity</dt>
                            <dd className="font-medium">{offering.capacity} guests</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Average Price</dt>
                            <dd className="font-medium">${offering.basePrice}/person</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Status</dt>
                            <dd className="font-medium capitalize">{offering.status?.toLowerCase()}</dd>
                        </div>
                    </dl>
                </Card>
            </div>
        </div>
    );
}
