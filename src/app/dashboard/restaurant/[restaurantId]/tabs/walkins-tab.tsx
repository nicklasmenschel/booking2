"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Users, Plus, Clock } from "lucide-react";

interface WalkInsTabProps {
    walkIns: any[];
    offering: any;
    instances: any[];
}

export function WalkInsTab({ walkIns, offering, instances }: WalkInsTabProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [partySize, setPartySize] = useState(2);
    const [phone, setPhone] = useState("");

    return (
        <div className="space-y-4">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Walk-in Management</h3>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Walk-in
                    </Button>
                </div>

                {showAddForm && (
                    <div className="p-4 border border-border rounded-lg mb-4 space-y-3">
                        <Input
                            placeholder="Guest name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Party size"
                                value={partySize}
                                onChange={(e) => setPartySize(parseInt(e.target.value) || 2)}
                                min="1"
                            />
                            <Input
                                type="tel"
                                placeholder="Phone (optional)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowAddForm(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button>Seat Guest</Button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                        Current wait time: ~15 minutes
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Next available: {instances.length > 0 ? formatTime(instances[0].startTime) : "N/A"}
                    </p>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Walk-in History (Today)</h3>
                {walkIns.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No walk-ins today
                    </p>
                ) : (
                    <div className="space-y-3">
                        {walkIns.map((walkIn) => (
                            <div
                                key={walkIn.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-border"
                            >
                                <div>
                                    <p className="font-medium">{walkIn.guestName}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Party of {walkIn.partySize}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(walkIn.joinedAt)}
                                        </span>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        walkIn.status === "SEATED"
                                            ? "success"
                                            : walkIn.status === "LEFT"
                                                ? "secondary"
                                                : "default"
                                    }
                                >
                                    {walkIn.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

