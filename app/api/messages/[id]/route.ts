import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Update message (mark as read)
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { id } = params
        const body = await request.json()

        const message = await prisma.message.update({
            where: { id },
            data: body
        })

        return NextResponse.json(message)
    } catch (error) {
        console.error('Error updating message:', error)
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }
}

// DELETE - Delete a message
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { id } = params

        await prisma.message.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting message:', error)
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }
}
