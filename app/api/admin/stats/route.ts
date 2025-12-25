import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [
            totalBookings,
            pendingBookings,
            totalProjects,
            totalPosts,
            totalServices,
            recentBookings
        ] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.project.count(),
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
            projects: totalProjects,
            posts: totalPosts,
            services: totalServices,
            recentBookings
        })
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
    }
}
