import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = !!session

        const posts = await prisma.post.findMany({
            where: isAdmin
                ? {}
                : { isPublished: true, isVisible: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, excerpt, content, coverImage, tags, category, isPublished } = body

        let titleStr = title
        try {
            const titleObj = JSON.parse(title)
            titleStr = titleObj.uz || titleObj.en || titleObj.ru || title
        } catch (e) {
            // content is already string or invalid json
        }

        const slug = generateSlug(titleStr)

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                tags: tags || [],
                category,
                isPublished: isPublished || false,
                publishedAt: isPublished ? new Date() : null,
            },
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
}
