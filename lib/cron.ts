import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { sendReminderToUser, sendReminderToDoctor } from '@/lib/telegram'

// Run every minute to check for reminders
export function startReminderCron() {
    cron.schedule('* * * * *', async () => {
        try {
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

                    console.log(`Sent ${reminder.type} reminder for booking ${reminder.bookingId}`)
                } catch (error) {
                    console.error(`Error sending reminder ${reminder.id}:`, error)
                }
            }
        } catch (error) {
            console.error('Error in reminder cron:', error)
        }
    })

    console.log('Reminder cron job started')
}
