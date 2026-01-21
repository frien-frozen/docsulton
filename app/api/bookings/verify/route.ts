import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/bookings/verify - Check if booking is verified
export async function POST(request: Request) {
    try {
        const { bookingId } = await request.json()

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                paymentStatus: true,
                status: true,
                updatedAt: true
            }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        return NextResponse.json({
            isVerified: booking.paymentStatus === 'VERIFIED',
            verifiedAt: booking.updatedAt
        })
    } catch (error) {
        console.error('Verification check error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
