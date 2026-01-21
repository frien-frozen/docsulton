import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const serviceId = searchParams.get('serviceId') // Get selected service

    if (!dateStr) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    try {
        const date = new Date(dateStr)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        // Get selected service duration (default to 30 minutes if not provided)
        let selectedServiceDuration = 30 // default
        if (serviceId) {
            const service = await prisma.service.findUnique({
                where: { id: serviceId }
            })
            if (service) {
                selectedServiceDuration = service.duration
            }
        }

        // 1. Get Settings
        let settings = await prisma.availabilitySettings.findFirst()
        if (!settings) {
            settings = await prisma.availabilitySettings.create({
                data: { workingHoursStart: 8, workingHoursEnd: 20, blockedDays: "0" }
            })
        }

        // 2. Get Blocked Rules
        // safe check if model exists (runtime safety if migration pending)
        let blockedRules: any[] = []
        try {
            // @ts-ignore
            blockedRules = await prisma.blockedTime.findMany()
        } catch (e) {
            console.warn('BlockedTime table might not exist yet')
        }

        // 3. Get Existing Bookings for the day (with service duration info)
        const existingBookings = await prisma.booking.findMany({
            where: {
                slot: {
                    startTime: { gte: startOfDay, lte: endOfDay }
                },
                status: { in: ['PENDING', 'APPROVED'] } // Only active bookings block slots
            },
            include: {
                slot: true,
                service: true
            }
        })

        // Build list of occupied time ranges
        const occupiedRanges = existingBookings.map(booking => {
            const start = booking.slot.startTime.getTime()
            const duration = booking.service.duration // in minutes
            const end = start + (duration * 60 * 1000) // convert to milliseconds
            return { start, end }
        })

        // 4. Generate Dynamic Slots
        const slots = []
        const startHour = settings.workingHoursStart
        const endHour = settings.workingHoursEnd
        const dayOfWeek = date.getDay() // 0-6

        // Check global blocked day
        if (settings.blockedDays.split(',').map(Number).includes(dayOfWeek)) {
            return NextResponse.json([]) // Full day block
        }

        // Iterate hours
        for (let h = startHour; h < endHour; h++) {
            // :00 slot
            slots.push(createSlot(date, h, 0))
            // :30 slot
            slots.push(createSlot(date, h, 30))
        }

        // 5. Filter & Map
        const availableSlots = slots.filter(slot => {
            const slotStart = slot.startTime.getTime()
            const slotEnd = slot.endTime.getTime()

            // Calculate the end time if this slot is booked with the selected service
            const newBookingEnd = slotStart + (selectedServiceDuration * 60 * 1000)

            // Check if this slot overlaps with any occupied range
            const hasOverlap = occupiedRanges.some(range => {
                // Overlap occurs if the new booking (slotStart to newBookingEnd) 
                // intersects with any existing booking (range.start to range.end)
                // Two ranges overlap if: start1 < end2 AND start2 < end1
                return slotStart < range.end && range.start < newBookingEnd
            })

            if (hasOverlap) return false

            const slotH = slot.startTime.getHours()
            const slotM = slot.startTime.getMinutes()
            const slotVal = slotH * 60 + slotM

            // Check Blocked Rules
            const isBlocked = blockedRules.some(rule => {
                const [rH, rM] = rule.startTime.split(':').map(Number)
                const ruleStart = rH * 60 + rM
                const [eH, eM] = rule.endTime.split(':').map(Number)
                const ruleEnd = eH * 60 + eM

                if (rule.type === 'RECURRING') {
                    if (rule.dayOfWeek === dayOfWeek) {
                        return slotVal >= ruleStart && slotVal < ruleEnd
                    }
                } else if (rule.type === 'SPECIFIC_DATE') {
                    const rDate = new Date(rule.date)
                    if (rDate.toDateString() === date.toDateString()) {
                        return slotVal >= ruleStart && slotVal < ruleEnd
                    }
                }
                return false
            })

            return !isBlocked
        }).map(slot => ({
            ...slot,
            id: 'dynamic_' + slot.startTime.getTime(), // Fake ID for frontend
            isBooked: false
        }))

        return NextResponse.json(availableSlots)

    } catch (error) {
        console.error('Error in dynamic slots:', error)
        return NextResponse.json([])
    }
}

function createSlot(baseDate: Date, hour: number, minute: number) {
    const start = new Date(baseDate)
    start.setHours(hour, minute, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 30)
    return { startTime: start, endTime: end }
}
