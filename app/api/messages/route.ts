import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, subject, message } = body

        const newMessage = await prisma.message.create({
            data: {
                name,
                email,
                phone,
                subject,
                message,
            },
        })

        return NextResponse.json(newMessage, { status: 201 })
    } catch (error) {
        console.error('Error creating message:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}
