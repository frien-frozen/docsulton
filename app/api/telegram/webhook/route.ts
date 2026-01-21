import { NextResponse } from 'next/server'
import { getTelegramBot } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'

// POST /api/telegram/webhook - Handle Telegram bot updates
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const bot = getTelegramBot()

        if (!bot) {
            return NextResponse.json({ error: 'Bot not initialized' }, { status: 500 })
        }

        // Handle message
        if (body.message) {
            const chatId = body.message.chat.id.toString()
            const text = body.message.text || ''
            const username = body.message.from.username

            // Handle /start command
            if (text.startsWith('/start')) {
                const welcomeMessage = `
👋 <b>Xush kelibsiz!</b>

Men Dr. Sultonbek Norkuzievning konsultatsiya botiman.

<b>Qanday ishlaydi:</b>
1️⃣ Saytda Telegram orqali kiring
2️⃣ Konsultatsiya uchun ro'yxatdan o'ting
3️⃣ To'lovni amalga oshiring
4️⃣ Tasdiqlanganidan keyin xabar olasiz

<b>Mavjud buyruqlar:</b>
/mybookings - Mening konsultatsiyalarim
/help - Yordam

Konsultatsiya vaqtidan 10 daqiqa oldin eslatma yuboriladi.
                `.trim()

                await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' })
                return NextResponse.json({ ok: true })
            }

            // Handle /mybookings command
            if (text.startsWith('/mybookings')) {
                const bookings = await prisma.booking.findMany({
                    where: {
                        telegramChatId: chatId
                    },
                    include: {
                        service: true,
                        slot: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5
                })

                if (bookings.length === 0) {
                    await bot.sendMessage(
                        chatId,
                        '📋 Sizda hozircha konsultatsiyalar yo\'q.',
                        { parse_mode: 'HTML' }
                    )
                    return NextResponse.json({ ok: true })
                }

                let message = '📋 <b>Sizning konsultatsiyalaringiz:</b>\n\n'

                bookings.forEach((booking, index) => {
                    const serviceName = booking.service.name || 'Xizmat'
                    const slotDate = new Date(booking.slot.startTime)
                    const dateStr = slotDate.toLocaleDateString('uz-UZ', {
                        month: 'short',
                        day: 'numeric'
                    })
                    const timeStr = slotDate.toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })

                    const statusEmoji = booking.status === 'APPROVED' ? '✅' :
                        booking.status === 'PENDING' ? '⏳' :
                            booking.status === 'REJECTED' ? '❌' : '📅'

                    message += `${index + 1}. ${statusEmoji} ${serviceName}\n`
                    message += `   📅 ${dateStr} ${timeStr}\n`
                    message += `   Status: ${booking.status}\n\n`
                })

                await bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
                return NextResponse.json({ ok: true })
            }

            // Handle /help command
            if (text.startsWith('/help')) {
                const helpMessage = `
ℹ️ <b>Yordam</b>

<b>Mavjud buyruqlar:</b>

/verify KOD - Konsultatsiyani tasdiqlash
/mybookings - Konsultatsiyalarim ro'yxati
/help - Bu yordam xabari

<b>Qanday ishlaydi:</b>

1. Saytda konsultatsiya uchun ariza topshiring
2. Telegram username'ingizni kiriting
3. Tasdiqlash kodini oling
4. Menga /verify KOD yuboring
5. To'lovni amalga oshiring
6. Konsultatsiya tasdiqlanganda xabar olasiz
7. 10 daqiqa oldin eslatma yuboramiz

<b>Savollar:</b>
Agar savollaringiz bo'lsa, to'g'ridan-to'g'ri @docsultonbek ga murojaat qiling.
                `.trim()

                await bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' })
                return NextResponse.json({ ok: true })
            }

            // Unknown command
            await bot.sendMessage(
                chatId,
                '❓ Noma\'lum buyruq. /help buyrug\'ini yuboring.',
                { parse_mode: 'HTML' }
            )
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Telegram webhook error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// GET endpoint to set webhook
export async function GET(request: Request) {
    try {
        const bot = getTelegramBot()
        if (!bot) {
            return NextResponse.json({ error: 'Bot not initialized' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'setWebhook') {
            const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`
            // @ts-ignore - node-telegram-bot-api types might have casing issues
            await bot.setWebHook(webhookUrl)
            return NextResponse.json({ ok: true, webhookUrl })
        }

        if (action === 'getWebhookInfo') {
            // @ts-ignore
            const info = await bot.getWebHookInfo()
            return NextResponse.json(info)
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Telegram webhook setup error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
