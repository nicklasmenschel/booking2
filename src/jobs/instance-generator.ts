import { db } from "@/lib/db";
import { RecurrenceFrequency } from "@prisma/client";

export async function generateUpcomingInstances() {
    // 1. Find all active recurrence rules
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
            // Logic similar to createOffering but extending the timeline
            // Start from last generated or today
            const start = rule.lastGenerated || new Date();
            // Generate for next 30 days buffer
            const end = new Date();
            end.setDate(end.getDate() + 30);

            // Don't generate past rule.until
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

            // Get dates between now and buffer
            const dates = rrule.between(new Date(), end, true);

            // TODO: Filter out dates that already exist in DB to avoid dupes/errors
            // For now, simpler to rely on "lastGenerated" marker or unique constraint?
            // Schema has @@unique([offeringId, date, startTime]) but only if these match exactly.

            // Batch process dates
            for (const date of dates) {
                // Set times
                const startTime = new Date(date);
                // Default duration 2 hours (TODO: Store defaultDuration on Offering)
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 2);

                // Check strict uniqueness
                const exists = await db.eventInstance.findFirst({
                    where: {
                        offeringId: rule.offeringId,
                        date: startTime, // Prisma compares Date object to @db.Date column
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

            // Update state
            await db.recurrenceRule.update({
                where: { id: rule.id },
                data: { lastGenerated: new Date() }
            });

        } catch (e) {
            console.error(`Failed to generate for rule ${rule.id}`, e);
        }
    }
}

