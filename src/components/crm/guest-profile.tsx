'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addGuestNote, addGuestTag, removeGuestTag } from '@/actions/crm';
import { toast } from 'sonner';
import {
    User,
    DollarSign,
    Calendar,
    TrendingDown,
    Users,
    Tag,
    StickyNote,
    X,
} from 'lucide-react';

interface GuestProfileProps {
    guestHistory: {
        guest: {
            id: string;
            name: string | null;
            email: string;
            createdAt: Date;
        };
        bookings: any[];
        stats: {
            totalBookings: number;
            completedBookings: number;
            cancelledBookings: number;
            totalSpent: number;
            cancellationRate: number;
            averagePartySize: number;
        };
        notes: any[];
        tags: any[];
    };
}

export function GuestProfile({ guestHistory }: GuestProfileProps) {
    const { guest, bookings, stats, notes, tags } = guestHistory;

    const [newNote, setNewNote] = useState('');
    const [newTag, setNewTag] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isAddingTag, setIsAddingTag] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error('Note cannot be empty');
            return;
        }

        setIsAddingNote(true);
        const result = await addGuestNote(guest.id, newNote);

        if (result.success) {
            toast.success('Note added');
            setNewNote('');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to add note');
        }
        setIsAddingNote(false);
    };

    const handleAddTag = async () => {
        if (!newTag.trim()) {
            toast.error('Tag cannot be empty');
            return;
        }

        setIsAddingTag(true);
        const result = await addGuestTag(guest.id, newTag);

        if (result.success) {
            toast.success('Tag added');
            setNewTag('');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to add tag');
        }
        setIsAddingTag(false);
    };

    const handleRemoveTag = async (tagId: string) => {
        const result = await removeGuestTag(tagId);

        if (result.success) {
            toast.success('Tag removed');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to remove tag');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Guest Header */}
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{guest.name || 'Guest'}</h1>
                        <p className="text-gray-600">{guest.email}</p>
                        <p className="text-sm text-gray-500">
                            Member since {new Date(guest.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Tags */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag: any) => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                                {tag.tag}
                                <button
                                    onClick={() => handleRemoveTag(tag.id)}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button size="sm" onClick={handleAddTag} disabled={isAddingTag}>
                            Add
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Bookings</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    <p className="text-xs text-gray-500">{stats.completedBookings} completed</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Lifetime Value</span>
                    </div>
                    <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total spent</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm">Cancel Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.cancellationRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{stats.cancelledBookings} cancelled</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Avg Party</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.averagePartySize.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">guests per booking</p>
                </Card>
            </div>

            {/* Notes Section */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <StickyNote className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold">Notes</h2>
                </div>

                {/* Add Note */}
                <div className="mb-4">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this guest..."
                        className="w-full px-3 py-2 border rounded-lg resize-none"
                        rows={3}
                    />
                    <Button
                        className="mt-2"
                        onClick={handleAddNote}
                        disabled={isAddingNote}
                    >
                        {isAddingNote ? 'Adding...' : 'Add Note'}
                    </Button>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                    {notes.length === 0 ? (
                        <p className="text-gray-500 text-sm">No notes yet</p>
                    ) : (
                        notes.map((note: any) => (
                            <div
                                key={note.id}
                                className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
                            >
                                <p className="text-sm">{note.note}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(note.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(note.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Booking History */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Booking History</h2>
                <div className="space-y-3">
                    {bookings.length === 0 ? (
                        <p className="text-gray-500 text-sm">No bookings yet</p>
                    ) : (
                        bookings.map((booking: any) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{booking.offering.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(booking.instance.date).toLocaleDateString()} •{' '}
                                        {booking.guestCount} guests
                                    </p>
                                    <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN'
                                                ? 'bg-green-100 text-green-700'
                                                : booking.status === 'CONFIRMED'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${Number(booking.totalAmount).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">#{booking.bookingNumber}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
