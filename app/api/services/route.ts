import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const showAll = searchParams.get('all') === 'true'

        const where = showAll ? {} : { isVisible: true }

        console.log('Fetching services from database...')
        const services = await prisma.service.findMany({
            where,
            orderBy: { price: 'asc' }
        })
        console.log('Services fetched successfully:', services.length)
        return NextResponse.json(services)
    } catch (error) {
        console.error('Error fetching services:', error)
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
        })
        return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const service = await prisma.service.create({
            data: {
                name: body.name, // Expecting JSON string
                description: body.description, // Expecting JSON string
                duration: parseInt(body.duration),
                price: parseInt(body.price),
                currency: 'UZS',
                isVisible: body.isVisible ?? true
            }
        })
        return NextResponse.json(service)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
    }
}
