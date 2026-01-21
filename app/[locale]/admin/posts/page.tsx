'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Trash2, Edit2, Eye, EyeOff, Calendar, Upload, X, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useModal } from '@/contexts/ModalContext'
import { uploadToFirebase } from '@/lib/storage'

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
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
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form State - simplified to plain strings
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
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
            if (Array.isArray(data)) {
                setPosts(data)
            } else {
                console.error('Posts API returned non-array:', data)
                setPosts([])
            }
        } catch (error) {
            console.error(error)
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    // Parse title - handles both old JSON format and new plain string
    const parseTitle = (title: string) => {
        try {
            const obj = JSON.parse(title)
            return obj.uz || obj.en || obj.ru || title
        } catch {
            return title
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await uploadToFirebase(file, 'posts')
            setFormData(prev => ({ ...prev, coverImage: url }))
        } catch (error) {
            console.error(error)
            modal.showError('Xatolik', 'Rasm yuklanmadi')
        } finally {
            setUploading(false)
            if (e.target) e.target.value = ''
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
            title: parseTitle(post.title),
            excerpt: parseTitle(post.excerpt),
            content: parseTitle(post.content),
            coverImage: post.coverImage || '',
            tags: post.tags,
            isPublished: post.isPublished
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
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
        parseTitle(p.title).toLowerCase().includes(searchTerm.toLowerCase())
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
                        <div className="text-center py-20">Yuklanmoqda...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">Maqolalar topilmadi</div>
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
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{parseTitle(post.title)}</h3>
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
                                        {parseTitle(post.excerpt)}
                                    </p>

                                    <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(post.createdAt), 'dd.MM.yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.isPublished ? (
                                                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    <Eye className="w-3 h-3" /> Nashr qilingan
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    <EyeOff className="w-3 h-3" /> Qoralama
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {(() => {
                                                try {
                                                    return JSON.parse(post.tags).map((tag: string, i: number) => (
                                                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">#{tag}</span>
                                                    ))
                                                } catch {
                                                    return null
                                                }
                                            })()}
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
                                className="bg-white p-8 rounded-3xl w-full max-w-3xl shadow-2xl my-8 relative"
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition">
                                    <X className="w-5 h-5" />
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingPost ? 'Maqolani tahrirlash' : 'Yangi maqola'}</h2>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Maqola sarlavhasi"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Qisqacha tavsif</label>
                                        <textarea
                                            value={formData.excerpt}
                                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Maqola haqida qisqacha..."
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Muqova rasmi</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />

                                        {formData.coverImage ? (
                                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                                                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition disabled:opacity-50"
                                            >
                                                {uploading ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                        <span className="text-sm text-gray-500">Rasm yuklash uchun bosing</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Asosiy matn (Markdown)</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                                            placeholder="Maqola matni..."
                                            rows={10}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Markdown formatini qo'llab-quvvatlaydi</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teglar (vergul bilan)</label>
                                        <input
                                            type="text"
                                            value={getTagsText()}
                                            onChange={e => handleTagsChange(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="sog'liq, urologiya, maslahatlar"
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPublished}
                                            onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-gray-700">Nashr qilish</span>
                                    </label>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
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
