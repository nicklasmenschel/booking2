'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Grid3x3, Users2 } from 'lucide-react';

interface CapacityModeSelectorProps {
    offeringId: string;
    currentMode: 'table-based' | 'simple';
    onModeChange: (mode: 'table-based' | 'simple') => void;
}

export function CapacityModeSelector({
    offeringId,
    currentMode,
    onModeChange
}: CapacityModeSelectorProps) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Grid3x3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Capacity Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Choose how to manage your restaurant's capacity
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card
                    className={`p-4 cursor-pointer transition-all ${currentMode === 'table-based'
                            ? 'border-2 border-green-600 bg-green-50'
                            : 'border-2 border-transparent hover:border-gray-300'
                        }`}
                    onClick={() => onModeChange('table-based')}
                >
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${currentMode === 'table-based' ? 'bg-green-600' : 'bg-gray-100'
                            }`}>
                            <Grid3x3 className={`h-5 w-5 ${currentMode === 'table-based' ? 'text-white' : 'text-gray-600'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Table-Based</h4>
                            <p className="text-xs text-muted-foreground">
                                Track individual tables with specific capacities and assignments
                            </p>
                        </div>
                    </div>
                </Card>

                <Card
                    className={`p-4 cursor-pointer transition-all ${currentMode === 'simple'
                            ? 'border-2 border-green-600 bg-green-50'
                            : 'border-2 border-transparent hover:border-gray-300'
                        }`}
                    onClick={() => onModeChange('simple')}
                >
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${currentMode === 'simple' ? 'bg-green-600' : 'bg-gray-100'
                            }`}>
                            <Users2 className={`h-5 w-5 ${currentMode === 'simple' ? 'text-white' : 'text-gray-600'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Simple Capacity</h4>
                            <p className="text-xs text-muted-foreground">
                                Set max covers per time slot without tracking specific tables
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
