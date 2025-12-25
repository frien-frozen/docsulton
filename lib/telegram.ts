import TelegramBot from 'node-telegram-bot-api'

const token = process.env.TELEGRAM_BOT_TOKEN!
const doctorChatId = process.env.TELEGRAM_DOCTOR_CHAT_ID || ''

// Create bot instance (polling disabled for webhook mode)
let bot: TelegramBot | null = null

export function getTelegramBot() {
    if (!bot && token) {
        bot = new TelegramBot(token, { polling: false })
    }
    return bot
}

// Helper function to send message
export async function sendTelegramMessage(chatId: string, message: string, options?: any) {
    try {
        const telegramBot = getTelegramBot()
        if (!telegramBot) {
            console.error('Telegram bot not initialized')
            return null
        }
        return await telegramBot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            ...options
        })
    } catch (error) {
        console.error('Error sending Telegram message:', error)
        return null
    }
}

// Send consultation approved notification to user
export async function sendConsultationApprovedToUser(
    chatId: string,
    data: {
        date: string
        time: string
        service: string
        meetingLink: string
    }
) {
    const message = `
✅ <b>Konsultatsiya tasdiqlandi!</b>

📅 <b>Sana:</b> ${data.date}
🕐 <b>Vaqt:</b> ${data.time}
🏥 <b>Xizmat:</b> ${data.service}
🔗 <b>Meeting link:</b> ${data.meetingLink}

10 daqiqa oldin eslatma yuboramiz!
  `.trim()

    return await sendTelegramMessage(chatId, message)
}

// Send consultation notification to doctor
export async function sendConsultationToDoctor(data: {
    patientName: string
    patientPhone: string
    date: string
    time: string
    service: string
}) {
    if (!doctorChatId) {
        console.error('Doctor chat ID not configured')
        return null
    }

    const message = `
👨‍⚕️ <b>Yangi konsultatsiya!</b>

👤 <b>Bemor:</b> ${data.patientName}
📞 <b>Telefon:</b> ${data.patientPhone}
📅 <b>Sana va vaqt:</b> ${data.date} ${data.time}
🏥 <b>Xizmat:</b> ${data.service}
  `.trim()

    return await sendTelegramMessage(doctorChatId, message)
}

// Send reminder to user (10 minutes before)
export async function sendReminderToUser(
    chatId: string,
    meetingLink: string
) {
    const message = `
⏰ <b>Eslatma!</b>

Konsultatsiyangiz 10 daqiqadan keyin boshlanadi!
🔗 <b>Meeting link:</b> ${meetingLink}
  `.trim()

    return await sendTelegramMessage(chatId, message)
}

// Send reminder to doctor (10 minutes before)
export async function sendReminderToDoctor(data: {
    patientName: string
    patientPhone: string
}) {
    if (!doctorChatId) {
        console.error('Doctor chat ID not configured')
        return null
    }

    const message = `
⏰ <b>Eslatma!</b>

10 daqiqadan keyin konsultatsiya:
👤 <b>Bemor:</b> ${data.patientName}
📞 <b>Telefon:</b> ${data.patientPhone}
  `.trim()

    return await sendTelegramMessage(doctorChatId, message)
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification code to user
export async function sendVerificationCode(
    username: string,
    code: string
) {
    // This will be handled by the bot when user starts conversation
    // For now, we just return the code to display on website
    return code
}

// Format date for display
export function formatDateForTelegram(date: Date): string {
    return new Intl.DateTimeFormat('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date)
}

// Format time for display
export function formatTimeForTelegram(date: Date): string {
    return new Intl.DateTimeFormat('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}
