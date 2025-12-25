import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
    try {
        const today = new Date()
        const slots = []

        // Generate for next 30 days
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)

            // Skip weekends if desired (optional, assuming work every day for now or just standard slots)
            // For 10:00 to 16:00
            for (let hour = 10; hour < 16; hour++) {
                const startTime = new Date(date)
                startTime.setHours(hour, 0, 0, 0)

                const endTime = new Date(startTime)
                endTime.setMinutes(endTime.getMinutes() + 30)

                // Check if slot already exists to prevent duplicates
                const exists = await prisma.timeSlot.findFirst({
                    where: { startTime }
                })

                if (!exists) {
                    await prisma.timeSlot.create({
                        data: {
                            startTime,
                            endTime,
                            isBooked: false
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Slots generated for next 30 days' })
    } catch (error) {
        return NextResponse.json({ error: 'Error generating slots' }, { status: 500 })
    }
}
