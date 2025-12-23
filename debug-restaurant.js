const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();
const db = prisma;

async function main() {
    const slug = 'bella-mjhtynb4'; // From user report
    console.log(`Fetching restaurant with slug: ${slug}`);

    try {
        const restaurant = await db.offering.findUnique({
            where: { slug },
            include: { host: true }
        });

        if (!restaurant) {
            console.log("Restaurant NOT FOUND");
        } else {
            console.log("Restaurant FOUND:");
            console.log("Name:", restaurant.name);
            console.log("Type:", restaurant.type);
            console.log("BasePrice Type:", typeof restaurant.basePrice);
            console.log("BasePrice Value:", restaurant.basePrice);
            console.log("JSON:", JSON.stringify(restaurant, null, 2));
        }
    } catch (e) {
        console.error("Query Error:", e);
    } finally {
        await db.$disconnect();
    }
}

main();
