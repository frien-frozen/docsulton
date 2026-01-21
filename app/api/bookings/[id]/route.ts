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

        // Auto-generate meeting link if approving and none provided
        let finalMeetingLink = meetingLink
        if (status === 'APPROVED' && !finalMeetingLink) {
            // Generate unique Google Meet-style link (abc-defg-hij)
            const chars = 'abcdefghijklmnopqrstuvwxyz'
            const gen = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
            finalMeetingLink = `https://meet.google.com/${gen(3)}-${gen(4)}-${gen(3)}`
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: {
                status,
                paymentStatus,
                meetingLink: finalMeetingLink
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

            // Send Telegram notifications if params exist
            if (booking.telegramChatId && finalMeetingLink) {
                const slotDate = new Date(booking.slot.startTime)
                const formattedTime = slotDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                // Service name is now a plain string, no need to parse
                const serviceName = booking.service.name || 'Xizmat'

                // Send to user
                await sendConsultationApprovedToUser(booking.telegramChatId, {
                    date: formatDateForTelegram(slotDate),
                    time: formattedTime,
                    service: serviceName,
                    meetingLink: finalMeetingLink
                })

                // Send to doctor
                await sendConsultationToDoctor({
                    patientName: booking.user.username,
                    patientPhone: booking.user.phone || 'N/A',
                    date: formatDateForTelegram(slotDate),
                    time: formattedTime,
                    service: serviceName
                })

                // Create reminders for 10 minutes before
                const slotDateTime = new Date(booking.slot.startTime)
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
