import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const { searchParams } = new URL(request.url)
        const isAdmin = !!session

        const projects = await prisma.project.findMany({
            where: isAdmin ? {} : { isVisible: true },
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, content, images, liveUrl, githubUrl, techStack, featured, isVisible } = body

        const maxOrder = await prisma.project.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true },
        })

        const project = await prisma.project.create({
            data: {
                title,
                description,
                content,
                images: images || "[]",
                liveUrl,
                githubUrl,
                techStack: techStack || "[]",
                featured: featured || false,
                isVisible: isVisible !== undefined ? isVisible : true,
                order: (maxOrder?.order || 0) + 1,
            },
        })

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
