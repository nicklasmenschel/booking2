'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export type ReportCategory = 'SCAM' | 'UNSAFE' | 'OFFENSIVE' | 'SPAM' | 'INAPPROPRIATE' | 'OTHER';
export type ReportTargetType = 'OFFERING' | 'USER' | 'REVIEW' | 'BOOKING';

interface SubmitReportData {
    targetType: ReportTargetType;
    targetId: string;
    category: ReportCategory;
    details?: string;
}

export async function submitReport(data: SubmitReportData) {
    try {
        // Get current user (optional - can be anonymous)
        const { userId } = await auth();

        // Validate target exists
        switch (data.targetType) {
            case 'OFFERING':
                const offering = await db.offering.findUnique({
                    where: { id: data.targetId },
                    select: { id: true },
                });
                if (!offering) {
                    return { success: false, error: 'Offering not found' };
                }
                break;
            case 'USER':
                const user = await db.user.findUnique({
                    where: { id: data.targetId },
                    select: { id: true },
                });
                if (!user) {
                    return { success: false, error: 'User not found' };
                }
                break;
            case 'REVIEW':
                const review = await db.review.findUnique({
                    where: { id: data.targetId },
                    select: { id: true },
                });
                if (!review) {
                    return { success: false, error: 'Review not found' };
                }
                break;
            case 'BOOKING':
                const booking = await db.booking.findUnique({
                    where: { id: data.targetId },
                    select: { id: true },
                });
                if (!booking) {
                    return { success: false, error: 'Booking not found' };
                }
                break;
        }

        // Create report
        const report = await db.report.create({
            data: {
                reportedBy: userId || undefined,
                targetType: data.targetType,
                targetId: data.targetId,
                category: data.category,
                details: data.details,
                status: 'PENDING',
            },
        });

        // TODO: Send notification to admin team
        // await sendEmail({
        //   to: 'safety@gardentable.com',
        //   subject: `New ${data.category} Report`,
        //   html: `Report ID: ${report.id}...`,
        // });

        return { success: true, reportId: report.id };
    } catch (error) {
        console.error('Error submitting report:', error);
        return { success: false, error: 'Failed to submit report' };
    }
}

export async function getPendingReports() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    // Check if user is admin
    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const reports = await db.report.findMany({
        where: {
            status: 'PENDING',
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 100,
    });

    return reports;
}

export async function resolveReport(reportId: string, resolution: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    // Check if user is admin
    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, id: true },
    });

    if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    await db.report.update({
        where: { id: reportId },
        data: {
            status: 'RESOLVED',
            reviewedBy: user.id,
            reviewedAt: new Date(),
            resolution,
        },
    });

    return { success: true };
}
