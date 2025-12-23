"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
    offerings: any[];
}

export function CalendarView({ offerings }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Get all instances for the month
    const instances = offerings.flatMap((offering) =>
        offering.instances.map((instance: any) => ({
            ...instance,
            offeringName: offering.name,
            offeringType: offering.type,
        }))
    );

    const getEventsForDay = (day: Date) => {
        return instances.filter((instance) => isSameDay(new Date(instance.startTime), day));
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                    <Button onClick={previousMonth} variant="outline" size="sm">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button onClick={nextMonth} variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={index}
                            className={`min-h-24 p-2 border rounded-lg ${!isCurrentMonth ? "bg-slate-50" : "bg-white"
                                } ${isToday ? "border-blue-500 border-2" : "border-slate-200"}`}
                        >
                            <div
                                className={`text-sm font-medium mb-1 ${!isCurrentMonth ? "text-slate-400" : "text-slate-900"
                                    }`}
                            >
                                {format(day, "d")}
                            </div>

                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-xs p-1 rounded truncate ${event.offeringType === "RESTAURANT"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                        title={event.offeringName}
                                    >
                                        {format(new Date(event.startTime), "h:mm a")} {event.offeringName}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-slate-500">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                    <span className="text-slate-600">Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded"></div>
                    <span className="text-slate-600">Restaurant</span>
                </div>
            </div>
        </div>
    );
}
