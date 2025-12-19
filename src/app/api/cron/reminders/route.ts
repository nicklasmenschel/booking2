import { NextResponse } from "next/server";
import { sendReminders } from "@/jobs/send-reminders";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await sendReminders();
        return new NextResponse("Reminders sent", { status: 200 });
    } catch (error) {
        console.error("Cron Reminders Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
