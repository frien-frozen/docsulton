import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const rules = await prisma.blockedTime.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(rules)
    } catch (error) {
        console.error('Error fetching blocked times:', error)
        return NextResponse.json([], { status: 200 }) // Return empty array on error for safety
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { type, dayOfWeek, date, startTime, endTime, note } = body

        // Validate
        if (!type || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const rule = await prisma.blockedTime.create({
            data: {
                type,
                dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : null,
                date: date ? new Date(date) : null,
                startTime,
                endTime,
                note
            }
        })

        return NextResponse.json(rule)
    } catch (error) {
        console.error('Error creating blocked time:', error)
        return NextResponse.json({ error: 'Error creating rule' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await prisma.blockedTime.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting rule:', error)
        return NextResponse.json({ error: 'Error deleting rule' }, { status: 500 })
    }
}
