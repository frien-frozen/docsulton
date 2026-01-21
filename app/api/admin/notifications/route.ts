import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get notification settings from database or env
        const settings = {
            telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
            telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
            emailNotifications: true,
            telegramNotifications: !!process.env.TELEGRAM_BOT_TOKEN
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching notification settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // In a production app, you'd save these to a database
        // For now, we'll just return success
        // You should update your .env file manually with these values

        console.log('Notification settings updated:', {
            telegramBotToken: body.telegramBotToken ? '***' : '',
            telegramChatId: body.telegramChatId,
            telegramNotifications: body.telegramNotifications
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving notification settings:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
