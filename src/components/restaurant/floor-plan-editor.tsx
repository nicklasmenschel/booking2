"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    Circle,
    Square,
    RectangleHorizontal,
    Plus,
    Trash2,
    RotateCw,
    Palette,
    Save,
    Download,
} from "lucide-react";

interface TablePosition {
    id: string;
    tableNumber: string;
    capacity: number;
    shape: "ROUND" | "SQUARE" | "RECTANGLE";
    xPosition: number;
    yPosition: number;
    rotation: number;
    color: string;
}

interface FloorPlanEditorProps {
    tables: TablePosition[];
    onSave: (tables: TablePosition[]) => Promise<void>;
    canvasWidth?: number;
    canvasHeight?: number;
}

function DraggableTable({
    table,
    onRotate,
    onColorChange,
    onDelete,
}: {
    table: TablePosition;
    onRotate: () => void;
    onColorChange: (color: string) => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: table.id,
    });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        left: `${table.xPosition}px`,
        top: `${table.yPosition}px`,
        rotate: `${table.rotation}deg`,
        backgroundColor: table.color,
        opacity: isDragging ? 0.5 : 1,
    };

    const shapeClass =
        table.shape === "ROUND"
            ? "rounded-full"
            : table.shape === "SQUARE"
                ? "rounded-lg aspect-square"
                : "rounded-lg";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`absolute cursor-move ${shapeClass} border-2 border-white shadow-lg transition-all hover:shadow-xl group`}
            {...listeners}
            {...attributes}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-white">
                <div className="text-lg font-bold">{table.tableNumber}</div>
                <div className="text-xs opacity-90">{table.capacity} seats</div>

                {/* Controls - show on hover */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRotate();
                        }}
                        className="bg-white text-slate-700 p-1 rounded-full shadow-md hover:bg-slate-100"
                    >
                        <RotateCw className="h-3 w-3" />
                    </button>
                    <input
                        type="color"
                        value={table.color}
                        onChange={(e) => {
                            e.stopPropagation();
                            onColorChange(e.target.value);
                        }}
                        className="w-6 h-6 rounded-full cursor-pointer"
                        title="Change color"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function FloorPlanEditor({
    tables: initialTables,
    onSave,
    canvasWidth = 1200,
    canvasHeight = 800,
}: FloorPlanEditorProps) {
    const [tables, setTables] = useState<TablePosition[]>(initialTables);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const { setNodeRef } = useDroppable({
        id: "floor-plan-canvas",
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        setTables((prevTables) =>
            prevTables.map((table) =>
                table.id === active.id
                    ? {
                        ...table,
                        xPosition: Math.max(0, Math.min(canvasWidth - 100, table.xPosition + delta.x)),
                        yPosition: Math.max(0, Math.min(canvasHeight - 100, table.yPosition + delta.y)),
                    }
                    : table
            )
        );

        setActiveId(null);
    };

    const addTable = (shape: "ROUND" | "SQUARE" | "RECTANGLE") => {
        const newTable: TablePosition = {
            id: `table-${Date.now()}`,
            tableNumber: `T${tables.length + 1}`,
            capacity: 4,
            shape,
            xPosition: 100 + (tables.length % 5) * 120,
            yPosition: 100 + Math.floor(tables.length / 5) * 120,
            rotation: 0,
            color: "#3b82f6",
        };
        setTables([...tables, newTable]);
    };

    const rotateTable = (id: string) => {
        setTables((prevTables) =>
            prevTables.map((table) =>
                table.id === id ? { ...table, rotation: (table.rotation + 45) % 360 } : table
            )
        );
    };

    const changeTableColor = (id: string, color: string) => {
        setTables((prevTables) =>
            prevTables.map((table) => (table.id === id ? { ...table, color } : table))
        );
    };

    const deleteTable = (id: string) => {
        setTables((prevTables) => prevTables.filter((table) => table.id !== id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(tables);
        } finally {
            setIsSaving(false);
        }
    };

    const exportFloorPlan = () => {
        const dataStr = JSON.stringify(tables, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `floor-plan-${new Date().toISOString().split("T")[0]}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    const activeTable = tables.find((t) => t.id === activeId);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Add Table:</span>
                    <Button
                        onClick={() => addTable("ROUND")}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Circle className="h-4 w-4" />
                        Round
                    </Button>
                    <Button
                        onClick={() => addTable("SQUARE")}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Square className="h-4 w-4" />
                        Square
                    </Button>
                    <Button
                        onClick={() => addTable("RECTANGLE")}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <RectangleHorizontal className="h-4 w-4" />
                        Rectangle
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={exportFloorPlan} variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Floor Plan"}
                    </Button>
                </div>
            </div>

            {/* Canvas */}
            <DndContext
                sensors={sensors}
                onDragStart={({ active }) => setActiveId(active.id as string)}
                onDragEnd={handleDragEnd}
            >
                <div
                    ref={setNodeRef}
                    className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-inner overflow-hidden"
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                        backgroundImage: `
                            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                >
                    {tables.map((table) => (
                        <DraggableTable
                            key={table.id}
                            table={table}
                            onRotate={() => rotateTable(table.id)}
                            onColorChange={(color) => changeTableColor(table.id, color)}
                            onDelete={() => deleteTable(table.id)}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTable && (
                        <div
                            className={`w-24 h-24 ${activeTable.shape === "ROUND"
                                    ? "rounded-full"
                                    : activeTable.shape === "SQUARE"
                                        ? "rounded-lg aspect-square"
                                        : "rounded-lg"
                                } border-2 border-white shadow-lg flex items-center justify-center text-white`}
                            style={{
                                backgroundColor: activeTable.color,
                                rotate: `${activeTable.rotation}deg`,
                            }}
                        >
                            <div className="text-center">
                                <div className="text-lg font-bold">{activeTable.tableNumber}</div>
                                <div className="text-xs opacity-90">{activeTable.capacity} seats</div>
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Tables: {tables.length}</span>
                    <span className="text-slate-600">
                        Total Capacity: {tables.reduce((sum, t) => sum + t.capacity, 0)} seats
                    </span>
                </div>
            </div>
        </div>
    );
}
