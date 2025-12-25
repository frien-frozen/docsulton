import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    sendConsultationApprovedToUser,
    sendConsultationToDoctor,
    formatDateForTelegram,
    formatTimeForTelegram
} from '@/lib/telegram'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, paymentStatus, meetingLink } = body

        // Get the current booking to check if status is changing
        const currentBooking = await prisma.booking.findUnique({
            where: { id },
            include: {
                user: true,
                service: true,
                slot: true
            }
        })

        const booking = await prisma.booking.update({
            where: { id },
            data: {
                status,
                paymentStatus,
                meetingLink
            },
            include: {
                user: true,
                service: true,
                slot: true
            }
        })

        // If status changed to APPROVED, increment stats and send notifications
        if (currentBooking && currentBooking.status !== 'APPROVED' && status === 'APPROVED') {
            // Increment patient and consultation counts
            const stats = await prisma.statistics.findFirst()
            if (stats) {
                await prisma.statistics.update({
                    where: { id: stats.id },
                    data: {
                        patients: stats.patients + 1,
                        consultations: stats.consultations + 1
                    }
                })
            }

            // Send Telegram notifications if user is verified
            if (booking.telegramChatId && booking.isVerified && meetingLink) {
                const slotDate = new Date(booking.slot.date)
                const serviceName = JSON.parse(booking.service.name).uz || 'Xizmat'

                // Send to user
                await sendConsultationApprovedToUser(booking.telegramChatId, {
                    date: formatDateForTelegram(slotDate),
                    time: booking.slot.time,
                    service: serviceName,
                    meetingLink
                })

                // Send to doctor
                await sendConsultationToDoctor({
                    patientName: booking.user.username,
                    patientPhone: booking.user.phone || 'N/A',
                    date: formatDateForTelegram(slotDate),
                    time: booking.slot.time,
                    service: serviceName
                })

                // Create reminders for 10 minutes before
                const slotDateTime = new Date(`${booking.slot.date}T${booking.slot.time}`)
                const reminderTime = new Date(slotDateTime.getTime() - 10 * 60 * 1000) // 10 minutes before

                // Create user reminder
                await prisma.reminder.create({
                    data: {
                        bookingId: booking.id,
                        scheduledAt: reminderTime,
                        type: 'USER'
                    }
                })

                // Create doctor reminder
                await prisma.reminder.create({
                    data: {
                        bookingId: booking.id,
                        scheduledAt: reminderTime,
                        type: 'DOCTOR'
                    }
                })
            }
        }

        return NextResponse.json(booking)
    } catch (error) {
        console.error('Error updating booking:', error)
        return NextResponse.json({ error: 'Error updating booking' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { paymentScreenshot } = body

        const booking = await prisma.booking.update({
            where: { id },
            data: {
                paymentScreenshot,
                paymentStatus: 'PENDING' // Admin will verify
            },
            include: {
                service: true,
                slot: true,
                user: true
            }
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error('Error updating booking payment:', error)
        return NextResponse.json(
            { error: 'Error updating booking' },
            { status: 500 }
        )
    }
}


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get booking to find the slot ID before deleting
        const booking = await prisma.booking.findUnique({
            where: { id },
            select: { slotId: true }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Delete the booking
        await prisma.booking.delete({
            where: { id }
        })

        // Free up the slot
        if (booking.slotId) {
            await prisma.timeSlot.update({
                where: { id: booking.slotId },
                data: { isBooked: false }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting booking' }, { status: 500 })
    }
}
