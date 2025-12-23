"use server";

import { db } from "@/lib/db";
import { generateSlug, generateBookingNumber } from "@/lib/utils";
import { createOfferingSchema, type CreateOfferingInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { RecurrenceFrequency } from "@prisma/client";




export async function createOffering(input: CreateOfferingInput) {
    try {
        console.log("----------------------------------------");
        console.log("CREATE OFFERING SERVER ACTION CALLED");
        console.log("Raw Input Type:", input.type);
        console.log("Raw Input Category:", input.category);
        console.log("Raw Input:", JSON.stringify(input, null, 2));

        // FORCE TYPE CHECK
        // If the form sent RESTAURANT, ensure it stays RESTAURANT
        let finalType = input.type;
        if (input.type === "RESTAURANT") {
            console.log("Type is explicitly RESTAURANT");
            finalType = "RESTAURANT";
        }

        // Also check category as fallback
        if (input.category && (input.category.toLowerCase().includes("restaurant") || input.category.toLowerCase().includes("dining"))) {
            console.log("Category implies RESTAURANT, forcing type.");
            finalType = "RESTAURANT";
        }

        // Validate input
        const validatedData = createOfferingSchema.parse(input);

        // Override the type in validatedData to be safe
        validatedData.type = finalType; // TypeScript might complain but we need to ensure this

        console.log("Validated Data Type:", validatedData.type);
        console.log("----------------------------------------");

        // Get authenticated user
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        // Find or create user in database
        let user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            const clerkUser = await currentUser();
            user = await db.user.create({
                data: {
                    clerkId,
                    email: clerkUser?.emailAddresses[0]?.emailAddress || "",
                    name: clerkUser?.firstName
                        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
                        : null,
                    avatar: clerkUser?.imageUrl,
                    role: "HOST",
                },
            });
        } else if (user.role === "GUEST") {
            // Upgrade to HOST when creating first offering
            await db.user.update({
                where: { id: user.id },
                data: { role: "HOST" },
            });
        }

        // Generate unique slug
        let slug = generateSlug(validatedData.name);
        const existingSlug = await db.offering.findUnique({
            where: { slug },
        });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        // Create offering
        const offering = await db.offering.create({
            data: {
                slug,
                name: validatedData.name,
                tagline: validatedData.tagline || null,
                category: validatedData.category || null,
                description: validatedData.description,
                coverImage: validatedData.coverImage,
                images: validatedData.images || [],
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                country: validatedData.country,
                isVirtual: validatedData.isVirtual,
                virtualUrl: validatedData.virtualUrl,
                type: finalType, // Explicitly use our resolved type
                basePrice: validatedData.basePrice,
                currency: validatedData.currency,
                capacity: validatedData.capacity,
                cancellationPolicy: validatedData.cancellationPolicy,
                minPartySize: validatedData.minPartySize,
                maxPartySize: validatedData.maxPartySize,
                advanceBookingDays: validatedData.advanceBookingDays,
                accentColor: validatedData.accentColor,
                hostId: user.id,
                status: "DRAFT",
            },
        });

        // Handle Recurrence
        if (validatedData.recurrence) {
            const { frequency, interval, count, until, byWeekDay, byMonthDay, byMonth } = validatedData.recurrence;

            await db.recurrenceRule.create({
                data: {
                    offeringId: offering.id,
                    frequency: frequency as RecurrenceFrequency,
                    interval,
                    count,
                    until,
                    byWeekDay: byWeekDay || [],
                    byMonthDay: byMonthDay || [],
                    byMonth: byMonth || [],
                }
            });

            // Generate initial instances (up to 3 months or 'until' date)
            const { RRule } = await import("rrule");

            const freqMap: Record<string, number> = {
                DAILY: RRule.DAILY,
                WEEKLY: RRule.WEEKLY,
                MONTHLY: RRule.MONTHLY,
                YEARLY: RRule.YEARLY,
            };

            const start = new Date(validatedData.date || Date.now());
            // Ensure start time is set if available, otherwise default to noon
            if (validatedData.startTime) {
                const [hours, minutes] = validatedData.startTime.split(":").map(Number);
                start.setHours(hours, minutes, 0, 0);
            }

            console.log("Generating instances with recurrence:", validatedData.recurrence);

            const rule = new RRule({
                freq: freqMap[frequency],
                interval,
                count,
                until: until || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 3 months
                dtstart: start,
                byweekday: byWeekDay ? byWeekDay.map(d => {
                    const map: Record<string, any> = {
                        MO: RRule.MO, TU: RRule.TU, WE: RRule.WE, TH: RRule.TH, FR: RRule.FR, SA: RRule.SA, SU: RRule.SU
                    };
                    return map[d];
                }).filter(Boolean) : undefined,
                bymonthday: byMonthDay,
                bymonth: byMonth,
            });

            console.log("RRule generated:", rule.toString());
            const dates = rule.all();
            console.log("Generated dates count:", dates.length);

            // Batch create instances
            // Note: Prisma createMany is supported in Postgres
            const instancesData = dates.map(date => {
                const startTime = new Date(date);
                const endTime = new Date(date);
                if (validatedData.endTime) {
                    const [endH, endM] = validatedData.endTime.split(":").map(Number);
                    endTime.setHours(endH, endM, 0, 0);
                } else {
                    endTime.setHours(startTime.getHours() + 2);
                }

                return {
                    offeringId: offering.id,
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()), // Just the date part for query ease if needed, but schema says DateTime. Let's keep strict.
                    // Actually schema has date @db.Date, startTime DateTime. 
                    // Prisma handles js Date -> @db.Date automatically by stripping time.
                    startTime,
                    endTime,
                    capacity: validatedData.capacity,
                    availableSpots: validatedData.capacity,
                    status: "AVAILABLE" as const, // Cast for type safety
                };
            });

            if (instancesData.length > 0) {
                await db.eventInstance.createMany({
                    data: instancesData,
                });
            }
        }

        // If one-time event with date, create instance (Legacy / ONE_TIME behavior)
        if (validatedData.type === "ONE_TIME" && validatedData.date && validatedData.startTime) {
            const date = new Date(validatedData.date);
            const [startHour, startMin] = validatedData.startTime.split(":").map(Number);
            const startTime = new Date(date);
            startTime.setHours(startHour, startMin, 0, 0);

            let endTime = new Date(startTime);
            if (validatedData.endTime) {
                const [endHour, endMin] = validatedData.endTime.split(":").map(Number);
                endTime = new Date(date);
                endTime.setHours(endHour, endMin, 0, 0);
            } else {
                endTime.setHours(startTime.getHours() + 2); // Default 2 hours
            }

            await db.eventInstance.create({
                data: {
                    offeringId: offering.id,
                    date,
                    startTime,
                    endTime,
                    capacity: validatedData.capacity,
                    availableSpots: validatedData.capacity,
                    status: "AVAILABLE",
                },
            });
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            data: {
                id: offering.id,
                slug: offering.slug
            }
        };

    } catch (error) {
        console.error("Error creating offering:", error);

        // Log validation errors in detail
        if (error instanceof Error && error.name === 'ZodError') {
            console.error("Validation errors:", JSON.stringify(error, null, 2));
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create event"
        };
    }
}

export async function publishOffering(offeringId: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const offering = await db.offering.findUnique({
            where: { id: offeringId },
            include: { instances: true },
        });

        if (!offering) {
            return { success: false, error: "Event not found" };
        }

        if (offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate offering has required fields
        if (!offering.name || !offering.description || !offering.coverImage) {
            return { success: false, error: "Please complete all required fields" };
        }

        // Validate has at least one instance for non-restaurant types
        if (offering.type !== "RESTAURANT" && offering.instances.length === 0) {
            return { success: false, error: "Please add at least one date and time" };
        }

        await db.offering.update({
            where: { id: offeringId },
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),
            },
        });

        revalidatePath("/dashboard");
        revalidatePath(`/e/${offering.slug}`);

        return { success: true };

    } catch (error) {
        console.error("Error publishing offering:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to publish event"
        };
    }
}

export async function updateOffering(
    offeringId: string,
    input: Partial<CreateOfferingInput>
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const offering = await db.offering.findUnique({
            where: { id: offeringId },
        });

        if (!offering) {
            return { success: false, error: "Event not found" };
        }

        if (offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const updateData: Record<string, unknown> = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.coverImage !== undefined) updateData.coverImage = input.coverImage;
        if (input.images !== undefined) updateData.images = input.images;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.city !== undefined) updateData.city = input.city;
        if (input.state !== undefined) updateData.state = input.state;
        if (input.country !== undefined) updateData.country = input.country;
        if (input.isVirtual !== undefined) updateData.isVirtual = input.isVirtual;
        if (input.virtualUrl !== undefined) updateData.virtualUrl = input.virtualUrl;
        if (input.basePrice !== undefined) updateData.basePrice = input.basePrice;
        if (input.capacity !== undefined) updateData.capacity = input.capacity;
        if (input.cancellationPolicy !== undefined) updateData.cancellationPolicy = input.cancellationPolicy;
        if (input.accentColor !== undefined) updateData.accentColor = input.accentColor;
        if (input.bookingWindowDays !== undefined) updateData.bookingWindowDays = input.bookingWindowDays;
        if (input.bookingOpensAt !== undefined) updateData.bookingOpensAt = input.bookingOpensAt;
        if (input.lastMinuteBookingHours !== undefined) updateData.lastMinuteBookingHours = input.lastMinuteBookingHours;

        await db.offering.update({
            where: { id: offeringId },
            data: updateData,
        });

        revalidatePath("/dashboard");
        revalidatePath(`/e/${offering.slug}`);

        return { success: true };

    } catch (error) {
        console.error("Error updating offering:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update event"
        };
    }
}

export async function deleteOffering(offeringId: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const offering = await db.offering.findUnique({
            where: { id: offeringId },
            include: {
                bookings: {
                    where: {
                        status: "CONFIRMED",
                    },
                },
            },
        });

        if (!offering) {
            return { success: false, error: "Event not found" };
        }

        if (offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check for active bookings
        if (offering.bookings.length > 0) {
            return {
                success: false,
                error: "Cannot delete event with active bookings. Please cancel all bookings first."
            };
        }

        await db.offering.delete({
            where: { id: offeringId },
        });

        revalidatePath("/dashboard");

        return { success: true };

    } catch (error) {
        console.error("Error deleting offering:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete event"
        };
    }
}

export async function getOfferingBySlug(slug: string) {
    try {
        const offering = await db.offering.findUnique({
            where: { slug },
            include: {
                host: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                instances: {
                    where: {
                        date: { gte: new Date() },
                        status: { not: "CANCELLED" },
                    },
                    orderBy: { date: "asc" },
                },
                ticketTiers: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                },
                customQuestions: {
                    orderBy: { sortOrder: "asc" },
                },
                reviews: {
                    where: { status: "PUBLISHED" },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                _count: {
                    select: {
                        bookings: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!offering || offering.status !== "PUBLISHED") {
            return null;
        }

        return offering;

    } catch (error) {
        console.error("Error fetching offering:", error);
        return null;
    }
}

export async function getHostOfferings() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found", data: [] };
        }

        const offerings = await db.offering.findMany({
            where: { hostId: user.id },
            include: {
                instances: {
                    where: {
                        date: { gte: new Date() },
                    },
                    orderBy: { date: "asc" },
                    take: 1,
                },
                _count: {
                    select: {
                        bookings: {
                            where: { status: "CONFIRMED" },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const safeOfferings = offerings.map(offering => ({
            ...offering,
            basePrice: Number(offering.basePrice),
            totalRevenue: Number(offering.totalRevenue),
            averageRating: offering.averageRating ? Number(offering.averageRating) : null,
            popularityScore: Number(offering.popularityScore),
        }));

        return { success: true, data: safeOfferings };

    } catch (error) {
        console.error("Error fetching host offerings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch events",
            data: []
        };
    }
}

export async function getTodayEvents() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found", data: [] };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const instances = await db.eventInstance.findMany({
            where: {
                offering: {
                    hostId: user.id,
                    status: "PUBLISHED",
                },
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                offering: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        coverImage: true,
                    },
                },
                bookings: {
                    where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
                    select: {
                        id: true,
                        guestCount: true,
                        checkedIn: true,
                    },
                },
            },
            orderBy: { startTime: "asc" },
        });

        const events = instances.map((instance) => ({
            id: instance.id,
            offeringId: instance.offering.id,
            name: instance.offering.name,
            slug: instance.offering.slug,
            coverImage: instance.offering.coverImage,
            startTime: instance.startTime,
            endTime: instance.endTime,
            capacity: instance.capacity,
            booked: instance.bookings.reduce((sum: number, b) => sum + b.guestCount, 0),
            checkedIn: instance.bookings.filter((b) => b.checkedIn).length,
        }));

        return { success: true, data: events };

    } catch (error) {
        console.error("Error fetching today's events:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch events",
            data: []
        };
    }
}
