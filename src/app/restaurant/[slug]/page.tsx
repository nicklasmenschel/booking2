import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";

/**
 * This route is deprecated - redirect to the unified /e/[slug] page
 * All public offering views are now consolidated under /e/[slug]
 */
export default async function RestaurantPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Verify this is a valid restaurant before redirecting
    const restaurant = await db.offering.findUnique({
        where: { slug },
        select: { type: true },
    });

    if (!restaurant || restaurant.type !== "RESTAURANT") {
        notFound();
    }

    // Redirect to unified public page
    redirect(`/e/${slug}`);
}
