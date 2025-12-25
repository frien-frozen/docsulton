import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    try {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        // Get all slots for the day
        const slots = await prisma.timeSlot.findMany({
            where: {
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: { startTime: 'asc' }
        })

        // Get all operations for the day
        const operations = await prisma.operation.findMany({
            where: {
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'CANCELLED' }
            }
        })

        // Filter out slots that conflict with operations or are outside working hours
        const availableSlots = slots.filter(slot => {
            const slotStart = new Date(slot.startTime)
            const slotEnd = new Date(slot.endTime)
            const hour = slotStart.getHours()
            const day = slotStart.getDay()

            // Check if weekend (Saturday=6, Sunday=0)
            if (day === 0 || day === 6) {
                return false
            }

            // Check if outside working hours (6:00 - 22:00)
            if (hour < 6 || hour >= 22) {
                return false
            }

            // Check if slot conflicts with any operation
            const hasConflict = operations.some(op => {
                const opStart = new Date(op.scheduledDate)
                const opEnd = new Date(opStart.getTime() + (op.duration || 60) * 60000) // duration in minutes

                return (slotStart < opEnd && slotEnd > opStart)
            })

            return !hasConflict
        })

        return NextResponse.json(availableSlots)
    } catch (error) {
        console.error('Error fetching slots:', error)
        return NextResponse.json({ error: 'Error fetching slots' }, { status: 500 })
    }
}
