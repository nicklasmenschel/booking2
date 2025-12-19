"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table as TableIcon, Plus, Trash2 } from "lucide-react";
import { createTable, deleteTable } from "@/actions/restaurant";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface Table {
    id: string;
    tableNumber: string;
    capacity: number;
    section: string;
    shape: "ROUND" | "SQUARE" | "RECTANGLE" | "BOOTH";
}

interface TableManagerProps {
    offeringId: string;
    initialTables: Table[];
}

export function TableManager({ offeringId, initialTables }: TableManagerProps) {
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        tableNumber: "",
        capacity: "4",
        section: "Main Dining",
        shape: "RECTANGLE" as "ROUND" | "SQUARE" | "RECTANGLE" | "BOOTH",
    });

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const result = await createTable({
                offeringId,
                tableNumber: formData.tableNumber,
                capacity: parseInt(formData.capacity),
                maxCapacity: parseInt(formData.capacity) + 2, // arbitrary logic for now
                section: formData.section,
                shape: formData.shape,
            });

            if (result.success) {
                toast.success("Table created");
                setIsDialogOpen(false);
                setFormData({ ...formData, tableNumber: "" }); // Reset necessary fields
                // In a real app we'd re-fetch or use router.refresh(), but for now we rely on revalidatePath in action
                // and maybe a full page reload or optimistic update.
                // Since this is a client component receiving props, we should probably use router.refresh() 
                // but let's just wait for the parent to re-render if we use router.refresh() inside the action handler?
                // Actually, revalidatePath on server + router.refresh() on client is the way.
                window.location.reload(); // Brute force refresh for MVP speed
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error("Failed to create table");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this table?")) return;
        try {
            const result = await deleteTable(id);
            if (result.success) {
                toast.success("Table deleted");
                window.location.reload();
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error("Failed to delete table");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Tables ({tables.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Table</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Table Number</label>
                                    <Input
                                        placeholder="e.g. 12"
                                        value={formData.tableNumber}
                                        onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Capacity</label>
                                    <Input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Section</label>
                                <Select
                                    value={formData.section}
                                    onValueChange={(val) => setFormData({ ...formData, section: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Main Dining">Main Dining</SelectItem>
                                        <SelectItem value="Patio">Patio</SelectItem>
                                        <SelectItem value="Bar">Bar</SelectItem>
                                        <SelectItem value="Private Room">Private Room</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Shape</label>
                                <Select
                                    value={formData.shape}
                                    onValueChange={(val: any) => setFormData({ ...formData, shape: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RECTANGLE">Rectangle</SelectItem>
                                        <SelectItem value="ROUND">Round</SelectItem>
                                        <SelectItem value="SQUARE">Square</SelectItem>
                                        <SelectItem value="BOOTH">Booth</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreate} disabled={isLoading} className="w-full">
                                {isLoading ? "Creating..." : "Create Table"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map((table) => (
                    <Card key={table.id} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-muted p-2 rounded-md">
                                <TableIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <button
                                onClick={() => handleDelete(table.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <div className="font-bold text-lg">Table {table.tableNumber}</div>
                            <div className="text-sm text-muted-foreground">{table.section}</div>
                            <div className="text-xs text-muted-foreground mt-1">{table.capacity} seats</div>
                        </div>
                    </Card>
                ))}
            </div>

            {tables.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No tables configured properly.</p>
                </div>
            )}
        </div>
    );
}
