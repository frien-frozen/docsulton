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
        const { certificates } = body // Array of { id, order }

        await prisma.$transaction(
            certificates.map((c: { id: string; order: number }) =>
                prisma.certificate.update({
                    where: { id: c.id },
                    data: { order: c.order },
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering certificates:', error)
        return NextResponse.json({ error: 'Failed to reorder certificates' }, { status: 500 })
    }
}
