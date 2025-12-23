'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteOffering } from '@/actions/offerings';
import { toast } from 'sonner';

interface DeleteOfferingButtonProps {
    offeringId: string;
    offeringName: string;
}

export function DeleteOfferingButton({ offeringId, offeringName }: DeleteOfferingButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${offeringName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        setIsDeleting(true);
        const result = await deleteOffering(offeringId);

        if (result.success) {
            toast.success('Event deleted successfully');
        } else {
            toast.error(result.error || 'Failed to delete event');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Delete event"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}
