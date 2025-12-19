import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gardentable.com';

    // Get all published offerings
    const offerings = await db.offering.findMany({
        where: {
            status: 'PUBLISHED',
        },
        select: {
            slug: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    // Static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/discover`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/create`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // Dynamic event routes
    const eventRoutes: MetadataRoute.Sitemap = offerings.map((offering) => ({
        url: `${baseUrl}/e/${offering.slug}`,
        lastModified: offering.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...eventRoutes];
}
