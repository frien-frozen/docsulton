import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/operations/[id] - Update operation
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const operation = await prisma.operation.update({
            where: { id },
            data: body
        })

        return NextResponse.json(operation)
    } catch (error) {
        console.error('Error updating operation:', error)
        return NextResponse.json({ error: 'Failed to update operation' }, { status: 500 })
    }
}

// DELETE /api/operations/[id] - Delete operation
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.operation.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting operation:', error)
        return NextResponse.json({ error: 'Failed to delete operation' }, { status: 500 })
    }
}
