'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addBookingNote } from '@/actions/crm';
import { toast } from 'sonner';
import { StickyNote } from 'lucide-react';

interface BookingNotesProps {
    bookingId: string;
    notes: Array<{
        id: string;
        note: string;
        createdAt: Date;
    }>;
}

export function BookingNotes({ bookingId, notes }: BookingNotesProps) {
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error('Note cannot be empty');
            return;
        }

        setIsAdding(true);
        const result = await addBookingNote(bookingId, newNote);

        if (result.success) {
            toast.success('Note added');
            setNewNote('');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to add note');
        }
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Booking Notes</h3>
                <span className="text-sm text-gray-500">({notes.length})</span>
            </div>

            {/* Add Note Form */}
            <div className="space-y-2">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a private note about this booking..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 resize-none"
                    rows={3}
                />
                <div className="flex justify-end">
                    <Button onClick={handleAddNote} disabled={isAdding}>
                        {isAdding ? 'Adding...' : 'Add Note'}
                    </Button>
                </div>
            </div>

            {/* Notes List */}
            <div className="space-y-2">
                {notes.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">
                        No notes yet. Add one above!
                    </p>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className="p-3 rounded-xl border-2 border-gray-200 bg-gray-50"
                        >
                            <p className="text-sm">{note.note}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(note.createdAt).toLocaleDateString()} at{' '}
                                {new Date(note.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
