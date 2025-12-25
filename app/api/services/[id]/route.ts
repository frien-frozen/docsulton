import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const body = await request.json()

        const service = await prisma.service.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                duration: parseInt(body.duration),
                price: parseInt(body.price),
                isVisible: body.isVisible
            }
        })
        return NextResponse.json(service)
    } catch (error) {
        return NextResponse.json({ error: 'Error updating service' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        // Check for bookings
        const bookingsCount = await prisma.booking.count({
            where: { serviceId: id }
        })

        if (bookingsCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete service with existing bookings. Please hide it instead.' },
                { status: 400 }
            )
        }

        await prisma.service.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting service' }, { status: 500 })
    }
}
