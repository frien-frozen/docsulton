import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get availability settings
export async function GET() {
    try {
        let settings = await prisma.availabilitySettings.findFirst()

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.availabilitySettings.create({
                data: {
                    workingHoursStart: 6,
                    workingHoursEnd: 22,
                    blockedDays: "0,6" // Sunday and Saturday
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
    }
}

// Update availability settings
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { workingHoursStart, workingHoursEnd, blockedDays } = body

        let settings = await prisma.availabilitySettings.findFirst()

        if (settings) {
            // Update existing
            settings = await prisma.availabilitySettings.update({
                where: { id: settings.id },
                data: {
                    workingHoursStart,
                    workingHoursEnd,
                    blockedDays
                }
            })
        } else {
            // Create new
            settings = await prisma.availabilitySettings.create({
                data: {
                    workingHoursStart,
                    workingHoursEnd,
                    blockedDays
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
    }
}
