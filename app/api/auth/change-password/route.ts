import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        const user = await prisma.user.findUnique({
            where: { username: 'admin' },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const { compare } = await import('bcryptjs')
        const isValid = await compare(currentPassword, user.password || '')

        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }

        const hashedPassword = await hash(newPassword, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }
}
