import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        console.log('Testing database connection...')
        const result = await prisma.$queryRaw`SELECT 1 as test`
        console.log('Database connection successful!', result)

        const serviceCount = await prisma.service.count()
        console.log('Service count:', serviceCount)

        return NextResponse.json({
            status: 'connected',
            serviceCount,
            test: result
        })
    } catch (error) {
        console.error('Database connection failed:', error)
        return NextResponse.json({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}
