"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Mail, Send, Clock, CheckCircle2, Users } from "lucide-react";

interface CommunicationTabProps {
    offering: any;
    bookings: any[];
}

export function CommunicationTab({ offering, bookings }: CommunicationTabProps) {
    const [messageType, setMessageType] = useState<"all" | "specific" | "waitlist">("all");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN");

    // Mock email history (in production, this would come from EmailLog)
    const emailHistory = [
        {
            id: "1",
            type: "CONFIRMATION",
            subject: "Booking Confirmed",
            sentTo: confirmedBookings.length,
            sentAt: new Date(),
            status: "SENT",
        },
        {
            id: "2",
            type: "REMINDER",
            subject: "Reminder: Your event is tomorrow",
            sentTo: confirmedBookings.length,
            sentAt: new Date(Date.now() - 86400000),
            status: "SENT",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Send Message */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Send Message</h3>

                <div className="space-y-4">
                    {/* Recipient Selection */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Send to</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMessageType("all")}
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                    messageType === "all"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>All Guests</span>
                                    <Badge variant="secondary">{confirmedBookings.length}</Badge>
                                </div>
                            </button>
                            <button
                                onClick={() => setMessageType("specific")}
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                    messageType === "specific"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                Specific Guests
                            </button>
                            <button
                                onClick={() => setMessageType("waitlist")}
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                    messageType === "waitlist"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                Waitlist
                            </button>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Subject</label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Event update: Important information"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Message</label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                            className="min-h-[150px]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button>
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                        </Button>
                        <Button variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            Schedule
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Email History */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Automated Emails Sent</h3>

                <div className="space-y-3">
                    {emailHistory.map((email) => (
                        <div
                            key={email.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{email.subject}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Sent to {email.sentTo} {email.sentTo === 1 ? "guest" : "guests"} •{" "}
                                        {formatDate(email.sentAt)}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="success">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {email.status}
                            </Badge>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Automated Email Schedule</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>✓ Booking confirmation (sent immediately)</li>
                        <li>✓ Reminder 24 hours before event (scheduled)</li>
                        <li>✓ Thank you + review request (sends after event)</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
}

