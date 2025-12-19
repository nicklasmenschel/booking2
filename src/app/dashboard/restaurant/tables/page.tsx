import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { TableManager } from "@/components/restaurant/table-manager";
import { redirect } from "next/navigation";

export default async function TablesPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // For MVP, just get the first restaurant/offering owned by user.
    // Ideally we'd have a selector context.
    const offering = await db.offering.findFirst({
        where: { hostId: userId, type: "RESTAURANT" },
    });

    if (!offering) {
        return (
            <div className="container py-8">
                <h1 className="text-2xl font-bold mb-4">Table Management</h1>
                <p>You don't have any restaurant offerings set up.</p>
                {/* A link to create one would be good */}
            </div>
        );
    }

    const tables = await db.table.findMany({
        where: { offeringId: offering.id },
        orderBy: { tableNumber: 'asc' }
    });

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-6">Table Management</h1>
            <p className="text-muted-foreground mb-8">Manage your floor plan and table inventory for {offering.name}.</p>

            <TableManager
                offeringId={offering.id}
                initialTables={tables.map((t: any) => ({
                    id: t.id,
                    tableNumber: t.tableNumber,
                    capacity: t.capacity,
                    section: t.section,
                    shape: t.shape
                }))}
            />
        </div>
    );
}
