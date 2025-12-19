import { NextResponse } from "next/server";
import { cleanupHolds } from "@/jobs/cleanup-holds";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await cleanupHolds();
        return new NextResponse("Cleanup completed", { status: 200 });
    } catch (error) {
        console.error("Cron Cleanup Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
