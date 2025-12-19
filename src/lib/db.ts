import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let connectionString = `${process.env.DATABASE_URL}`;

// If using Prisma Postgres local proxy, extract the actual DB URL
if (connectionString.includes("api_key=")) {
    try {
        const url = new URL(connectionString);
        const apiKey = url.searchParams.get("api_key");
        if (apiKey) {
            const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString());
            if (decoded.databaseUrl) {
                connectionString = decoded.databaseUrl;
            }
        }
    } catch (e) {
        console.error("Failed to decode API key from connection string", e);
    }
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}

export default db;
