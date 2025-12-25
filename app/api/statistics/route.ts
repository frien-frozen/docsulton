import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/statistics - Fetch statistics with auto-calculated experience
export async function GET() {
    try {
        let stats = await prisma.statistics.findFirst()

        // If no statistics exist, create default
        if (!stats) {
            stats = await prisma.statistics.create({
                data: {
                    operations: 0,
                    experienceStartYear: new Date().getFullYear(),
                    patients: 0,
                    consultations: 0,
                    successRate: 0
                }
            })
        }

        // Calculate current experience based on start year
        const currentYear = new Date().getFullYear()
        const calculatedExperience = currentYear - stats.experienceStartYear

        return NextResponse.json({
            ...stats,
            experience: calculatedExperience
        })
    } catch (error) {
        console.error('Error fetching statistics:', error)
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }
}

// PUT /api/statistics - Update statistics
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { operations, experienceStartYear, patients, consultations, successRate } = body

        let stats = await prisma.statistics.findFirst()

        if (!stats) {
            // Create if doesn't exist
            stats = await prisma.statistics.create({
                data: {
                    operations: operations || 0,
                    experienceStartYear: experienceStartYear || new Date().getFullYear(),
                    patients: patients || 0,
                    consultations: consultations || 0,
                    successRate: successRate || 0
                }
            })
        } else {
            // Update existing
            stats = await prisma.statistics.update({
                where: { id: stats.id },
                data: {
                    operations,
                    experienceStartYear,
                    patients,
                    consultations,
                    successRate
                }
            })
        }

        // Return with calculated experience
        const currentYear = new Date().getFullYear()
        const calculatedExperience = currentYear - stats.experienceStartYear

        return NextResponse.json({
            ...stats,
            experience: calculatedExperience
        })
    } catch (error) {
        console.error('Error updating statistics:', error)
        return NextResponse.json({ error: 'Failed to update statistics' }, { status: 500 })
    }
}
