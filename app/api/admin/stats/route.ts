import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [
            totalBookings,
            pendingBookings,
            totalPosts,
            totalServices,
            recentBookings
        ] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.post.count(),
            prisma.service.count(),
            prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { username: true } },
                    service: { select: { name: true } }
                }
            })
        ])

        return NextResponse.json({
            bookings: {
                total: totalBookings,
                pending: pendingBookings
            },
            posts: totalPosts,
            services: totalServices,
            recentBookings
        })
    } catch (error) {
        console.error('Admin Stats API Error:', error)
        if (error instanceof Error) {
            console.error('Stack:', error.stack)
        }
        console.warn('Returning default empty stats due to error')
        return NextResponse.json({
            bookings: { total: 0, pending: 0 },
            projects: 0,
            posts: 0,
            services: 0,
            recentBookings: []
        })
    }
}
