import { NextResponse } from "next/server";
import { generateUpcomingInstances } from "@/jobs/instance-generator";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await generateUpcomingInstances();
        return new NextResponse("Instances generated", { status: 200 });
    } catch (error) {
        console.error("Cron Generate Instances Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
