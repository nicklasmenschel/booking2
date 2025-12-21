import { db } from "@/lib/db";
import { RecurrenceFrequency } from "@prisma/client";

export async function generateUpcomingInstances() {
    // 1. Generate recurring event instances
    await generateRecurringEventInstances();

    // 2. Generate restaurant service period instances
    await generateRestaurantInstances();
}

/**
 * Generate instances for recurring events
 */
async function generateRecurringEventInstances() {
    const rules = await db.recurrenceRule.findMany({
        include: { offering: true }
    });

    const { RRule } = await import("rrule");
    const freqMap: Record<string, number> = {
        DAILY: RRule.DAILY,
        WEEKLY: RRule.WEEKLY,
        MONTHLY: RRule.MONTHLY,
        YEARLY: RRule.YEARLY,
    };

    console.log(`Processing ${rules.length} recurrence rules`);

    for (const rule of rules) {
        try {
            const start = rule.lastGenerated || new Date();
            const end = new Date();
            end.setDate(end.getDate() + 30);

            if (rule.until && end > rule.until) {
                // cap at rule.until
            }

            const rrule = new RRule({
                freq: freqMap[rule.frequency],
                interval: rule.interval,
                count: rule.count ?? undefined,
                until: rule.until ?? undefined,
                dtstart: start,
                byweekday: rule.byWeekDay.map(d => {
                    const map: Record<string, any> = {
                        MO: RRule.MO, TU: RRule.TU, WE: RRule.WE, TH: RRule.TH, FR: RRule.FR, SA: RRule.SA, SU: RRule.SU
                    };
                    return map[d];
                }).filter(Boolean),
                bymonthday: rule.byMonthDay,
                bymonth: rule.byMonth,
            });

            const dates = rrule.between(new Date(), end, true);

            for (const date of dates) {
                const startTime = new Date(date);
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 2);

                const exists = await db.eventInstance.findFirst({
                    where: {
                        offeringId: rule.offeringId,
                        date: startTime,
                        startTime: startTime,
                    }
                });

                if (!exists) {
                    await db.eventInstance.create({
                        data: {
                            offeringId: rule.offeringId,
                            date: startTime,
                            startTime,
                            endTime,
                            capacity: rule.offering.capacity,
                            availableSpots: rule.offering.capacity,
                            status: "AVAILABLE"
                        }
                    });
                }
            }

            await db.recurrenceRule.update({
                where: { id: rule.id },
                data: { lastGenerated: new Date() }
            });

        } catch (e) {
            console.error(`Failed to generate for rule ${rule.id}`, e);
        }
    }
}

/**
 * Generate instances for restaurant service periods
 */
async function generateRestaurantInstances() {
    // Find all restaurant offerings with active service periods
    const servicePeriods = await db.servicePeriod.findMany({
        where: {
            isActive: true,
        },
        include: {
            offering: true,
        },
    });

    console.log(`Processing ${servicePeriods.length} restaurant service periods`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate for next 30 days
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);

    for (const period of servicePeriods) {
        try {
            // Loop through each day in the 30-day window
            for (let currentDate = new Date(today); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
                // Convert to match our schema (1 = Monday, 7 = Sunday)
                const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

                // Check if this service period operates on this day
                if (!period.daysOfWeek.includes(adjustedDay)) {
                    continue;
                }

                // Generate time slots for this day
                const timeSlots = generateTimeSlots(
                    period.startTime,
                    period.lastSeating,
                    period.intervalMinutes
                );

                for (const slot of timeSlots) {
                    // Create full datetime for this slot
                    const [hours, minutes] = slot.start.split(':').map(Number);
                    const slotDateTime = new Date(currentDate);
                    slotDateTime.setHours(hours, minutes, 0, 0);

                    const [endHours, endMinutes] = slot.end.split(':').map(Number);
                    const endDateTime = new Date(currentDate);
                    endDateTime.setHours(endHours, endMinutes, 0, 0);

                    // Check if instance already exists
                    const exists = await db.eventInstance.findFirst({
                        where: {
                            offeringId: period.offeringId,
                            date: currentDate,
                            startTime: slotDateTime,
                        },
                    });

                    if (!exists) {
                        await db.eventInstance.create({
                            data: {
                                offeringId: period.offeringId,
                                date: new Date(currentDate),
                                startTime: slotDateTime,
                                endTime: endDateTime,
                                capacity: period.maxCoversPerSlot,
                                availableSpots: period.maxCoversPerSlot,
                                status: "AVAILABLE",
                            },
                        });
                    }
                }
            }

            console.log(`Generated instances for service period: ${period.name}`);
        } catch (e) {
            console.error(`Failed to generate for service period ${period.id}`, e);
        }
    }
}

/**
 * Generate time slots between start and last seating
 */
function generateTimeSlots(
    startTime: string,
    lastSeating: string,
    intervalMinutes: number
): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [lastHour, lastMinute] = lastSeating.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const lastMinutes = lastHour * 60 + lastMinute;

    while (currentMinutes <= lastMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const start = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const endMinutes = currentMinutes + intervalMinutes;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const end = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

        slots.push({ start, end });

        currentMinutes += intervalMinutes;
    }

    return slots;
}
