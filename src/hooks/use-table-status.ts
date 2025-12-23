"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";

export type TableStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "BEING_CLEARED";

interface TableStatusData {
    tableId: string;
    status: TableStatus;
    booking?: {
        id: string;
        guestName: string;
        partySize: number;
        checkInTime?: Date;
    };
}

export function useTableStatus(restaurantId: string, refreshInterval = 30000) {
    const [tableStatuses, setTableStatuses] = useState<Map<string, TableStatusData>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTableStatuses = async () => {
            try {
                const response = await fetch(`/api/restaurant/${restaurantId}/table-status`);
                const data = await response.json();

                const statusMap = new Map<string, TableStatusData>();
                data.forEach((item: TableStatusData) => {
                    statusMap.set(item.tableId, item);
                });

                setTableStatuses(statusMap);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch table statuses:", error);
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchTableStatuses();

        // Set up polling
        const interval = setInterval(fetchTableStatuses, refreshInterval);

        return () => clearInterval(interval);
    }, [restaurantId, refreshInterval]);

    const getTableStatus = (tableId: string): TableStatusData | undefined => {
        return tableStatuses.get(tableId);
    };

    const getStatusColor = (status: TableStatus): string => {
        switch (status) {
            case "AVAILABLE":
                return "#10b981"; // green
            case "RESERVED":
                return "#f59e0b"; // yellow
            case "OCCUPIED":
                return "#ef4444"; // red
            case "BEING_CLEARED":
                return "#f97316"; // orange
            default:
                return "#6b7280"; // gray
        }
    };

    return {
        tableStatuses,
        getTableStatus,
        getStatusColor,
        isLoading,
    };
}
