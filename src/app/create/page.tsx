"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Repeat, PartyPopper, Clock } from "lucide-react";

export default function CreatePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header - Premium */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-base font-medium">Back to Dashboard</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-32">
                <div className="text-center mb-20">
                    <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                        What are you creating?
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose the type of experience you want to host
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {/* One-Time Event */}
                    <Link
                        href="/create/event"
                        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 p-10 border-2 border-gray-200 hover:border-[#C9A76B] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Calendar className="h-40 w-40 text-[#C9A76B]" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-[#F7F3ED] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                <PartyPopper className="h-8 w-8 text-[#C9A76B]" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#C9A76B] transition-colors">
                                One-Time Event
                            </h2>
                            <p className="text-base text-gray-600 mb-8 leading-relaxed">
                                Perfect for single occasions with a specific date:
                            </p>
                            <ul className="space-y-4 text-base text-gray-700">
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Pop-up dinners
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Wine tastings
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Cooking classes
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Special celebrations
                                </li>
                            </ul>
                        </div>
                    </Link>

                    {/* Recurring Service */}
                    <Link
                        href="/create/service"
                        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 p-10 border-2 border-gray-200 hover:border-[#C9A76B] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Repeat className="h-40 w-40 text-[#C9A76B]" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-[#F7F3ED] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-8 w-8 text-[#C9A76B]" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#C9A76B] transition-colors">
                                Recurring Service
                            </h2>
                            <p className="text-base text-gray-600 mb-8 leading-relaxed">
                                For ongoing offerings with regular availability:
                            </p>
                            <ul className="space-y-4 text-base text-gray-700">
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Restaurant reservations
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Weekly dinner series
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Open table bookings
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#C9A76B]" />
                                    Ongoing experiences
                                </li>
                            </ul>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
