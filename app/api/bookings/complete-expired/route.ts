import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This endpoint auto-completes consultations that have ended
export async function POST() {
    try {
        const now = new Date()

        // Find all APPROVED bookings where consultation time + 1 hour has passed
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'APPROVED'
            },
            include: {
                slot: true
            }
        })

        const completedIds: string[] = []

        for (const booking of expiredBookings) {
            const consultationEnd = new Date(booking.slot.startTime)
            consultationEnd.setHours(consultationEnd.getHours() + 1)

            if (consultationEnd < now) {
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: 'COMPLETED' }
                })
                completedIds.push(booking.id)
            }
        }

        return NextResponse.json({
            success: true,
            completedCount: completedIds.length,
            completedIds
        })
    } catch (error) {
        console.error('Error completing expired bookings:', error)
        return NextResponse.json({ error: 'Error processing' }, { status: 500 })
    }
}
