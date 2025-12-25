import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = !!session

        const certificates = await prisma.certificate.findMany({
            where: isAdmin ? {} : { isVisible: true },
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(certificates)
    } catch (error) {
        console.error('Error fetching certificates:', error)
        return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, imageUrl, issuedBy, issuedDate } = body

        const maxOrder = await prisma.certificate.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true },
        })

        const certificate = await prisma.certificate.create({
            data: {
                title,
                description,
                imageUrl,
                issuedBy,
                issuedDate: issuedDate ? new Date(issuedDate) : null,
                order: (maxOrder?.order || 0) + 1,
            },
        })

        return NextResponse.json(certificate, { status: 201 })
    } catch (error) {
        console.error('Error creating certificate:', error)
        return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
    }
}
