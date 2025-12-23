import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { FloorPlanEditor } from "@/components/restaurant/floor-plan-editor";
import { saveTablePositions, getTablePositions, generateTableQRCodes } from "@/actions/floor-plan";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default async function FloorPlanPage() {
    const { userId } = await auth();

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    // Get user's first restaurant offering
    const offering = await db.offering.findFirst({
        where: {
            host: {
                clerkId: userId,
            },
            type: "RESTAURANT",
        },
    });

    if (!offering) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">No Restaurant Found</h1>
                    <p className="text-slate-600">
                        Please create a restaurant offering first before setting up your floor plan.
                    </p>
                </div>
            </div>
        );
    }

    const tables = await getTablePositions(offering.id);

    const handleSave = async (updatedTables: any[]) => {
        "use server";
        await saveTablePositions(offering.id, updatedTables);
    };

    const handleGenerateQRCodes = async () => {
        "use server";
        await generateTableQRCodes(offering.id);
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Floor Plan Editor</h1>
                    <p className="text-slate-600 mt-1">
                        Drag and drop tables to design your restaurant layout
                    </p>
                </div>
                <form action={handleGenerateQRCodes}>
                    <Button type="submit" variant="outline" className="gap-2">
                        <QrCode className="h-4 w-4" />
                        Generate QR Codes
                    </Button>
                </form>
            </div>

            <FloorPlanEditor tables={tables} onSave={handleSave} />
        </div>
    );
}
