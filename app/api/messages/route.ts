import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all messages
export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

// POST - Create a new message (from contact form)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, phone, subject, message } = body

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email and message are required' },
                { status: 400 }
            )
        }

        const newMessage = await prisma.message.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject: subject || null,
                message,
                isRead: false
            }
        })

        return NextResponse.json(newMessage, { status: 201 })
    } catch (error) {
        console.error('Error creating message:', error)
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }
}
