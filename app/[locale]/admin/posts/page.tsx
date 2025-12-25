'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit2, Eye, EyeOff, FileText, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MultiLangInput from '@/components/ui/MultiLangInput'
import { format } from 'date-fns'
import { useModal } from '@/contexts/ModalContext'

interface Post {
    id: string
    title: string // JSON
    slug: string
    excerpt: string // JSON
    content: string // JSON
    coverImage: string
    tags: string // JSON array
    isPublished: boolean
    createdAt: string
}

export default function AdminPostsPage() {
    const modal = useModal()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Form State
    const [formData, setFormData] = useState({
        title: JSON.stringify({ uz: '', ru: '', en: '' }),
        excerpt: JSON.stringify({ uz: '', ru: '', en: '' }),
        content: JSON.stringify({ uz: '', ru: '', en: '' }),
        coverImage: '',
        tags: '[]',
        isPublished: false
    })

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts')
            const data = await res.json()
            setPosts(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const parseLocale = (json: string, lang = 'uz') => {
        try {
            const obj = JSON.parse(json)
            return obj[lang] || Object.values(obj)[0] || ''
        } catch (e) {
            return json
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts'
            const method = editingPost ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingPost(null)
                resetForm()
                fetchPosts()
                modal.showSuccess('Muvaffaqiyatli', 'Maqola saqlandi')
            } else {
                modal.showError('Xatolik', 'Xatolik yuz berdi')
            }
        } catch (error) {
            console.error(error)
            modal.showError('Xatolik', 'Xatolik yuz berdi')
        }
    }

    const handleDelete = async (id: string) => {
        modal.showConfirm(
            "O'chirish",
            "Maqolani o'chirishni tasdiqlaysizmi?",
            async () => {
                try {
                    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
                    fetchPosts()
                    modal.showSuccess('Muvaffaqiyatli', "Maqola o'chirildi")
                } catch (error) {
                    console.error(error)
                    modal.showError('Xatolik', 'Xatolik yuz berdi')
                }
            },
            'danger'
        )
    }

    const openEdit = (post: Post) => {
        setEditingPost(post)
        setFormData({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage || '',
            tags: post.tags,
            isPublished: post.isPublished
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: JSON.stringify({ uz: '', ru: '', en: '' }),
            excerpt: JSON.stringify({ uz: '', ru: '', en: '' }),
            content: JSON.stringify({ uz: '', ru: '', en: '' }),
            coverImage: '',
            tags: '[]',
            isPublished: false
        })
    }

    // Helper for Tags
    const handleTagsChange = (text: string) => {
        const arr = text.split(',').map(s => s.trim()).filter(s => s)
        setFormData({ ...formData, tags: JSON.stringify(arr) })
    }

    const getTagsText = () => {
        try {
            const arr = JSON.parse(formData.tags)
            return Array.isArray(arr) ? arr.join(', ') : ''
        } catch { return '' }
    }


    const filteredPosts = posts.filter(p =>
        parseLocale(p.title).toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Blog Postlar
                        </h1>
                        <p className="text-gray-500 mt-1">Maqolalarni boshqarish</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setEditingPost(null); setIsModalOpen(true) }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi maqola
                    </button>
                </div>

                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="search"
                        placeholder="Maqola nomini izlash..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                    />
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">Loading...</div>
                    ) : (
                        filteredPosts.map((post) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={post.id}
                                className="glass p-6 rounded-2xl border border-white/50 hover:border-blue-200 transition-all duration-300 group flex flex-col md:flex-row gap-6 items-start"
                            >
                                {post.coverImage && (
                                    <div className="w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden shadow-sm shrink-0">
                                        <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="flex-1 space-y-2 w-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{parseLocale(post.title)}</h3>
                                            <p className="text-sm text-gray-400 font-mono">/{post.slug}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEdit(post)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {parseLocale(post.excerpt)}
                                    </p>

                                    <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(post.createdAt), 'dd.MM.yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.isPublished ? (
                                                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    <Eye className="w-3 h-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    <EyeOff className="w-3 h-3" /> Draft
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {JSON.parse(post.tags).map((tag: string, i: number) => (
                                                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-8 rounded-3xl w-full max-w-4xl shadow-2xl my-8 relative"
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition">
                                    <p className="text-xl">×</p>
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingPost ? 'Maqolani tahrirlash' : 'Yangi maqola'}</h2>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <MultiLangInput
                                                label="Sarlavha"
                                                value={formData.title}
                                                onChange={v => setFormData({ ...formData, title: v })}
                                                required
                                            />

                                            <MultiLangInput
                                                label="Qisqacha (Excerpt)"
                                                value={formData.excerpt}
                                                onChange={v => setFormData({ ...formData, excerpt: v })}
                                                type="textarea"
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                                                <input
                                                    type="url"
                                                    value={formData.coverImage}
                                                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="https://..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Teglar (vergul bilan)</label>
                                                <input
                                                    type="text"
                                                    value={getTagsText()}
                                                    onChange={e => handleTagsChange(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="health, urology, tips"
                                                />
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isPublished}
                                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="font-medium text-gray-700">Nashr qilish (Publish)</span>
                                            </label>
                                        </div>

                                        <div className="h-full">
                                            <MultiLangInput
                                                label="Asosiy Matn (Markdown)"
                                                value={formData.content}
                                                onChange={v => setFormData({ ...formData, content: v })}
                                                type="textarea"
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Markdown formatini qo'llab-quvvatlaydi.</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 mt-4"
                                    >
                                        Saqlash
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
