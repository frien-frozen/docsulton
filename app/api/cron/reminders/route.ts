import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderToUser, sendReminderToDoctor } from '@/lib/telegram'

// GET /api/cron/reminders - Check and send due reminders
export async function GET(request: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()

        // Find unsent reminders that are due
        const dueReminders = await prisma.reminder.findMany({
            where: {
                sent: false,
                scheduledAt: {
                    lte: now
                }
            },
            include: {
                booking: {
                    include: {
                        user: true,
                        service: true,
                        slot: true
                    }
                }
            }
        })

        const results = []

        // Send each reminder
        for (const reminder of dueReminders) {
            try {
                if (reminder.type === 'USER' && reminder.booking.telegramChatId && reminder.booking.meetingLink) {
                    await sendReminderToUser(
                        reminder.booking.telegramChatId,
                        reminder.booking.meetingLink
                    )
                } else if (reminder.type === 'DOCTOR') {
                    await sendReminderToDoctor({
                        patientName: reminder.booking.user.username,
                        patientPhone: reminder.booking.user.phone || 'N/A'
                    })
                }

                // Mark as sent
                await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: {
                        sent: true,
                        sentAt: new Date()
                    }
                })

                results.push({
                    id: reminder.id,
                    type: reminder.type,
                    bookingId: reminder.bookingId,
                    status: 'sent'
                })
            } catch (error) {
                console.error(`Error sending reminder ${reminder.id}:`, error)
                results.push({
                    id: reminder.id,
                    type: reminder.type,
                    bookingId: reminder.bookingId,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        return NextResponse.json({
            checked: dueReminders.length,
            results
        })
    } catch (error) {
        console.error('Error in reminder cron:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
