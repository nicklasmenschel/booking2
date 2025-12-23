"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Restaurant Page Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Something went wrong!</h2>
                <div className="bg-slate-100 p-3 rounded text-left text-xs font-mono overflow-auto max-h-32 text-slate-700">
                    {error.message}
                    {error.digest && <div className="mt-2 text-slate-500">Digest: {error.digest}</div>}
                </div>
                <Button onClick={reset} className="w-full">
                    Try again
                </Button>
            </div>
        </div>
    );
}
