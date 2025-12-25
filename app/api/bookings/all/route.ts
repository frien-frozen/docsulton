import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: true,
                service: true,
                slot: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(bookings)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 })
    }
}
