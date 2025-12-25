import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userEmail = searchParams.get('userEmail')

        if (!userEmail) {
            return NextResponse.json(
                { error: 'User email required' },
                { status: 401 }
            )
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { email: userEmail }
        })

        if (!user) {
            return NextResponse.json([])
        }

        // Get all complete bookings for user
        const consultations = await prisma.booking.findMany({
            where: {
                userId: user.id,
                isComplete: true
            },
            include: {
                service: true,
                slot: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(consultations)
    } catch (error) {
        console.error('Error fetching consultations:', error)
        return NextResponse.json(
            { error: 'Error fetching consultations' },
            { status: 500 }
        )
    }
}
