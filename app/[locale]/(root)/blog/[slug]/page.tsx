'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import ReactMarkdown from 'react-markdown'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Tag, Share2, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Post {
    id: string
    title: string
    content: string
    tags: string
    coverImage: string | null
    publishedAt: string
    category: string | null
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const locale = useLocale()
    const t = useTranslations()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then((posts: Post[]) => {
                const found = posts.find((p: any) => p.slug === slug)
                setPost(found || null)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [slug])

    const getLocalizedContent = (jsonString: string) => {
        try {
            const content = JSON.parse(jsonString)
            return content[locale] || content['uz'] || ''
        } catch (e) {
            return jsonString
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-soft">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-soft">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-gray-900">Maqola topilmadi</h1>
                    <Link href="/blog" className="text-blue-600 hover:underline">Blogga qaytish</Link>
                </div>
            </div>
        )
    }

    const title = getLocalizedContent(post.title)
    const content = getLocalizedContent(post.content)
    const tags = JSON.parse(post.tags || '[]')

    return (
        <div className="min-h-screen gradient-soft pb-20">
            {/* Hero Section with Cover Image */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/40 z-10"></div>
                {post.coverImage ? (
                    <img
                        src={post.coverImage}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                )}

                <div className="absolute bottom-0 left-0 w-full z-20 p-4 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link
                                href="/blog"
                                className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-all hover:-translate-x-1"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                <span className="font-medium">Blogga qaytish</span>
                            </Link>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span>Dr. Sultonbek</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(post.publishedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>5 daqiqa o'qish</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong rounded-3xl p-8 md:p-12 shadow-xl"
                >
                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-8">
                            {tags.map((tag: string, i: number) => (
                                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-blue max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>

                    {/* Share */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Ushbu maqolani ulashing:</span>
                        <div className="flex gap-4">
                            <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
