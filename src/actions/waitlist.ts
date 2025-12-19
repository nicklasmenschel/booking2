"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function joinWaitlist(offeringId: string, instanceId: string, partySize: number = 1) {
    try {
        const { userId: clerkId } = await auth();
        // Allow public waitlist? No, let's require auth for now as per schema logic (userId is optional in schema? No, checked schema... schema has guestEmail etc. but let's check user relation)
        // Schema:
        // model Waitlist { ... guestEmail String ... }
        // We can actually capture just email if not logged in.
        // But for MVP let's require login or pass email.
        // Current usage in widget assumes auth check isn't strictly enforced by UI, but action enforces it.

        if (!clerkId) {
            throw new Error("You must be logged in to join the waitlist");
        }

        const user = await db.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if already on waitlist
        const existing = await db.waitlist.findFirst({
            where: {
                instanceId,
                guestEmail: user.email,
                status: "ACTIVE"
            }
        });

        if (existing) {
            throw new Error("You are already on the waitlist for this date");
        }

        await db.waitlist.create({
            data: {
                offeringId,
                instanceId,
                guestEmail: user.email,
                guestName: user.name || "Guest",
                guestPhone: user.phone,
                partySize: partySize,
                status: "ACTIVE"
            }
        });

        // Revalidate
        const offering = await db.offering.findUnique({
            where: { id: offeringId },
            select: { slug: true }
        });

        if (offering) {
            revalidatePath(`/e/${offering.slug}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error joining waitlist:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to join waitlist",
        };
    }
}
