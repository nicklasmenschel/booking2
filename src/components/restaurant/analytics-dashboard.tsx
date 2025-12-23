"use client";

import { DollarSign, Users, TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";

interface AnalyticsDashboardProps {
    metrics: any;
    revenueTrends: any[];
    bookingSources: any[];
    peakHours: any[];
    turnoverRate: number;
}

export function AnalyticsDashboard({
    metrics,
    revenueTrends,
    bookingSources,
    peakHours,
    turnoverRate,
}: AnalyticsDashboardProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-slate-600 mt-1">Last 30 days performance</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard
                    title="Total Revenue"
                    value={`$${metrics.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="green"
                />
                <MetricCard
                    title="Total Covers"
                    value={metrics.totalCovers}
                    icon={Users}
                    color="blue"
                />
                <MetricCard
                    title="Avg Spend/Cover"
                    value={`$${metrics.averageSpend.toFixed(2)}`}
                    icon={TrendingUp}
                    color="purple"
                />
                <MetricCard
                    title="No-Show Rate"
                    value={`${metrics.noShowRate}%`}
                    icon={TrendingDown}
                    color="red"
                />
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trend</h2>
                <div className="h-64 flex items-end gap-2">
                    {revenueTrends.slice(-14).map((day: any, index: number) => {
                        const maxRevenue = Math.max(...revenueTrends.map((d: any) => d.revenue));
                        const height = (day.revenue / maxRevenue) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                    style={{ height: `${height}%` }}
                                    title={`$${day.revenue.toFixed(2)}`}
                                />
                                <span className="text-xs text-slate-600">
                                    {new Date(day.date).getDate()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Booking Sources */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Sources</h2>
                    <div className="space-y-3">
                        {bookingSources.map((source: any, index: number) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-700">{source.source}</span>
                                    <span className="font-medium">{source.count}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${source.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Peak Hours */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Peak Hours</h2>
                    <div className="space-y-2">
                        {peakHours.slice(0, 5).map((hour: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-slate-700">
                                    {hour.hour}:00 - {hour.hour + 1}:00
                                </span>
                                <span className="font-medium">{hour.count} bookings</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Turnover */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Average Table Turnover
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Time from check-in to check-out
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{turnoverRate}</div>
                        <div className="text-sm text-slate-600">minutes</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
}) {
    const colors = {
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        red: "bg-red-100 text-red-600",
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
