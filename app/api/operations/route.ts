import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/operations - List all operations
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') // Filter by status if provided

        const where = status ? { status } : {}

        const operations = await prisma.operation.findMany({
            where,
            orderBy: [
                { scheduledDate: 'asc' },
                { startTime: 'asc' }
            ]
        })

        return NextResponse.json(operations)
    } catch (error) {
        console.error('Error fetching operations:', error)
        return NextResponse.json({ error: 'Failed to fetch operations' }, { status: 500 })
    }
}

// POST /api/operations - Create new operation
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            patientName,
            patientPhone,
            operationType,
            description,
            scheduledDate,
            startTime,
            endTime
        } = body

        // Validate required fields
        if (!patientName || !operationType || !scheduledDate || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create operation
        const operation = await prisma.operation.create({
            data: {
                patientName,
                patientPhone,
                operationType,
                description,
                scheduledDate: new Date(scheduledDate),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: 'SCHEDULED'
            }
        })

        return NextResponse.json(operation)
    } catch (error) {
        console.error('Error creating operation:', error)
        return NextResponse.json({ error: 'Failed to create operation' }, { status: 500 })
    }
}
