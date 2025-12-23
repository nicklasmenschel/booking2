"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { Clock, Mail, User, X, CheckCircle2 } from "lucide-react";

interface WaitlistTabProps {
    waitlist: any[];
    offering: any;
}

export function WaitlistTab({ waitlist, offering }: WaitlistTabProps) {
    return (
        <div className="space-y-4">
            {waitlist.length === 0 ? (
                <Card className="p-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No waitlist entries</h3>
                    <p className="text-muted-foreground">
                        When time slots sell out, guests can join the waitlist here.
                    </p>
                </Card>
            ) : (
                <>
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-1">How Waitlist Works</h3>
                                <p className="text-sm text-blue-700">
                                    When a spot opens up, waitlist #1 is automatically notified. They have 10 minutes
                                    to claim the spot. If they don't respond, the system moves to waitlist #2, and so on.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        {waitlist.map((entry, index) => (
                            <Card key={entry.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                                            #{index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold">{entry.guestName}</p>
                                                <Badge variant="secondary">
                                                    {entry.partySize} {entry.partySize === 1 ? "guest" : "guests"}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <p className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    {entry.guestEmail}
                                                </p>
                                                {entry.guestPhone && (
                                                    <p className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        {entry.guestPhone}
                                                    </p>
                                                )}
                                                <p className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    Requested: {formatDate(entry.instance.date)} at {formatTime(entry.instance.startTime)}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    Joined: {formatDate(entry.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {entry.status === "NOTIFIED" && (
                                            <Badge variant="warning" className="mr-2">
                                                Notified - Waiting for response
                                            </Badge>
                                        )}
                                        {entry.status === "CLAIMED" && (
                                            <Badge variant="success" className="mr-2">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Claimed
                                            </Badge>
                                        )}
                                        <Button variant="outline" size="sm">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Notify
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Convert to Booking
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

