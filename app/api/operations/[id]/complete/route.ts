import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/operations/[id]/complete - Mark operation as completed
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { outcome, notes } = body // outcome: 'SUCCESS' or 'FAILED'

        if (!outcome || (outcome !== 'SUCCESS' && outcome !== 'FAILED')) {
            return NextResponse.json(
                { error: 'Invalid outcome. Must be SUCCESS or FAILED' },
                { status: 400 }
            )
        }

        // Update operation status
        const operation = await prisma.operation.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                outcome,
                notes
            }
        })

        // Update statistics
        const stats = await prisma.statistics.findFirst()
        if (stats) {
            // Get all completed operations
            const completedOps = await prisma.operation.findMany({
                where: {
                    status: 'COMPLETED',
                    outcome: { in: ['SUCCESS', 'FAILED'] }
                }
            })

            // Calculate success rate
            const totalCompleted = completedOps.length
            const successfulOps = completedOps.filter(op => op.outcome === 'SUCCESS').length
            const successRate = totalCompleted > 0 ? (successfulOps / totalCompleted) * 100 : 0

            // Update statistics
            await prisma.statistics.update({
                where: { id: stats.id },
                data: {
                    operations: totalCompleted,
                    successRate: Math.round(successRate * 10) / 10 // Round to 1 decimal
                }
            })
        }

        return NextResponse.json(operation)
    } catch (error) {
        console.error('Error completing operation:', error)
        return NextResponse.json({ error: 'Failed to complete operation' }, { status: 500 })
    }
}
