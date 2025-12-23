"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCampaign, sendCampaign } from "@/actions/marketing";
import { toast } from "@/components/ui/toast";
import { Plus, Send, Mail } from "lucide-react";
import { format } from "date-fns";

interface MarketingDashboardProps {
    restaurantId: string;
    campaigns: any[];
}

export function MarketingDashboard({ restaurantId, campaigns: initialCampaigns }: MarketingDashboardProps) {
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Marketing Campaigns</h1>
                    <p className="text-slate-600 mt-1">Engage with your guests via email and SMS</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Campaign
                </Button>
            </div>

            {/* Campaign List */}
            <div className="bg-white rounded-lg shadow-sm divide-y">
                {campaigns.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">
                        No campaigns yet. Create your first campaign to engage guests!
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {campaign.type} Campaign
                                    </p>
                                    {campaign.sentAt && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Sent {format(new Date(campaign.sentAt), "MMM d, yyyy")} •{" "}
                                            {campaign.recipientCount} recipients
                                        </p>
                                    )}
                                </div>
                                {!campaign.sentAt && (
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await sendCampaign(campaign.id);
                                                toast({
                                                    title: "Campaign sent!",
                                                    description: "Your campaign has been sent to guests.",
                                                });
                                            } catch (error) {
                                                toast({
                                                    title: "Error",
                                                    description: "Failed to send campaign.",
                                                    variant: "destructive",
                                                });
                                            }
                                        }}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Send Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateCampaignModal
                    restaurantId={restaurantId}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(newCampaign) => {
                        setCampaigns([newCampaign, ...campaigns]);
                        setShowCreateModal(false);
                        toast({
                            title: "Campaign created",
                            description: "Your campaign is ready to send.",
                        });
                    }}
                />
            )}
        </div>
    );
}

function CreateCampaignModal({
    restaurantId,
    onClose,
    onSuccess,
}: {
    restaurantId: string;
    onClose: () => void;
    onSuccess: (campaign: any) => void;
}) {
    const [formData, setFormData] = useState({
        name: "",
        type: "EMAIL" as "EMAIL" | "SMS" | "BOTH",
        subject: "",
        content: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const campaign = await createCampaign({
                restaurantId,
                ...formData,
                segmentCriteria: {}, // All guests for now
            });
            onSuccess(campaign);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create campaign.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Create Campaign</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Campaign Name
                        </label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Summer Special Promotion"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({ ...formData, type: e.target.value as any })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                            <option value="EMAIL">Email Only</option>
                            <option value="SMS">SMS Only</option>
                            <option value="BOTH">Email & SMS</option>
                        </select>
                    </div>

                    {(formData.type === "EMAIL" || formData.type === "BOTH") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Email Subject
                            </label>
                            <Input
                                value={formData.subject}
                                onChange={(e) =>
                                    setFormData({ ...formData, subject: e.target.value })
                                }
                                placeholder="Special offer just for you!"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Message
                        </label>
                        <Textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your message here..."
                            rows={6}
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Campaign</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
