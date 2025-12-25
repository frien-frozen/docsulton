'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string
    tags: string
    coverImage: string | null
    publishedAt: string
    category: string | null
}

export default function BlogPage() {
    const t = useTranslations('Blog')
    const locale = useLocale()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                setPosts(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const getLocalizedContent = (jsonString: string) => {
        try {
            const content = JSON.parse(jsonString)
            return content[locale] || content['uz'] || ''
        } catch (e) {
            return jsonString
        }
    }

    const filteredPosts = posts.filter(post => {
        const title = getLocalizedContent(post.title).toLowerCase()
        const excerpt = getLocalizedContent(post.excerpt).toLowerCase()
        const query = searchQuery.toLowerCase()
        return title.includes(query) || excerpt.includes(query)
    })

    return (
        <div className="min-h-screen gradient-soft pt-24 pb-20">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
                    >
                        {t('title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
                    >
                        {t('subtitle')}
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto relative"
                    >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl glass-strong border-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg text-gray-800 placeholder-gray-400"
                        />
                    </motion.div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 bg-white/50 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('emptyTitle')}</h3>
                        <p className="text-gray-500">{t('emptySubtitle')}</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {filteredPosts.map((post, index) => {
                            const title = getLocalizedContent(post.title)
                            const excerpt = getLocalizedContent(post.excerpt)
                            const tags = JSON.parse(post.tags || '[]')

                            return (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="break-inside-avoid"
                                >
                                    <Link href={`/blog/${post.slug}`} className="block group">
                                        <div className="floating-card bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                            {/* Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                                                {post.coverImage ? (
                                                    <img
                                                        src={post.coverImage}
                                                        alt={title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                                                )}

                                                {/* Category Badge */}
                                                <div className="absolute top-4 left-4 z-20">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                        {post.category || 'Blog'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                {/* Meta */}
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDate(post.publishedAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>5 {t('readTime')}</span>
                                                    </div>
                                                </div>

                                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {title}
                                                </h2>

                                                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                                                    {excerpt}
                                                </p>

                                                {/* Tags */}
                                                {tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {tags.slice(0, 3).map((tag: string, i: number) => (
                                                            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                                                                <Tag className="w-3 h-3" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center text-blue-600 font-semibold group/link">
                                                    {t('readMore')}
                                                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
