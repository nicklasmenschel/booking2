"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCampaign(data: {
    restaurantId: string;
    name: string;
    type: "EMAIL" | "SMS" | "BOTH";
    subject?: string;
    content: string;
    segmentCriteria: any;
}) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const campaign = await db.campaign.create({
        data,
    });

    revalidatePath("/dashboard/restaurant/marketing");
    return campaign;
}

export async function sendCampaign(campaignId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
    });

    if (!campaign) {
        throw new Error("Campaign not found");
    }

    // Get guests matching segment criteria
    const guests = await db.guest.findMany({
        where: {
            restaurantId: campaign.restaurantId,
            // Apply segment criteria here
        },
    });

    // TODO: Send emails/SMS to guests
    // For now, just update campaign status

    await db.campaign.update({
        where: { id: campaignId },
        data: {
            sentAt: new Date(),
            recipientCount: guests.length,
        },
    });

    revalidatePath("/dashboard/restaurant/marketing");
    return { success: true, recipientCount: guests.length };
}

export async function getCampaigns(restaurantId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    return await db.campaign.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
    });
}

export async function getReviews(restaurantId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    return await db.review.findMany({
        where: { offeringId: restaurantId },
        include: {
            booking: {
                select: {
                    guestName: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function respondToReview(reviewId: string, response: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    await db.review.update({
        where: { id: reviewId },
        data: {
            hostResponse: response,
            hostRespondedAt: new Date(),
        },
    });

    revalidatePath("/dashboard/restaurant/reviews");
    return { success: true };
}
