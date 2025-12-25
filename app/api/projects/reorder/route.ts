import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { projects } = body // Array of { id, order }

        await prisma.$transaction(
            projects.map((p: { id: string; order: number }) =>
                prisma.project.update({
                    where: { id: p.id },
                    data: { order: p.order },
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering projects:', error)
        return NextResponse.json({ error: 'Failed to reorder projects' }, { status: 500 })
    }
}
