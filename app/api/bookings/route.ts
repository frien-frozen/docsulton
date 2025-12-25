import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { serviceId, slotId, name, phone, notes, userEmail, userName, userImage } = body

        if (!userEmail) {
            return NextResponse.json(
                { error: 'Authentication details required' },
                { status: 401 }
            )
        }

        // Create or update user
        let user = await prisma.user.findFirst({
            where: { email: userEmail }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    username: userEmail.split('@')[0] + '_' + Date.now(),
                    email: userEmail,
                    name: name || userName,
                    image: userImage,
                    role: 'PATIENT'
                }
            })
        } else {
            // Update phone if provided
            if (phone && phone !== user.phone) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phone }
                })
            }
        }

        // Check if user already has a non-rejected booking
        const existingBooking = await prisma.booking.findFirst({
            where: {
                userEmail: userEmail,
                status: { not: 'REJECTED' }
            }
        })

        if (existingBooking) {
            console.log('User already has an active booking:', existingBooking.id)
            return NextResponse.json(
                { error: 'Sizda allaqachon faol buyurtma mavjud' },
                { status: 400 }
            )
        }

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId: user.id,
                serviceId,
                slotId,
                notes,
                status: 'PENDING',
                userEmail: userEmail,
                isComplete: true, // Mark as complete since user submitted payment
                progressStep: 6 // Final step
            },
            include: {
                service: true,
                slot: true
            }
        })

        // Mark slot as booked
        await prisma.timeSlot.update({
            where: { id: slotId },
            data: { isBooked: true }
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error('Error creating booking:', error)
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
        })
        return NextResponse.json({
            error: 'Error creating booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
        return NextResponse.json({ error: 'Phone required' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findFirst({
            where: { phone },
            include: {
                bookings: {
                    include: {
                        service: true,
                        slot: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json([])
        }

        return NextResponse.json(user.bookings)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 })
    }
}
