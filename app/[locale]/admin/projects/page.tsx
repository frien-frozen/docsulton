'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit2, Eye, EyeOff, Globe, Github } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MultiLangInput from '@/components/ui/MultiLangInput'
import { useModal } from '@/contexts/ModalContext'

interface Project {
    id: string
    title: string // JSON
    description: string // JSON
    content: string // JSON
    images: string // JSON array
    liveUrl?: string
    githubUrl?: string
    techStack: string // JSON array
    isVisible: boolean
    featured: boolean
    order: number
}

export default function AdminProjectsPage() {
    const modal = useModal()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Form State
    const [formData, setFormData] = useState({
        title: JSON.stringify({ uz: '', ru: '', en: '' }),
        description: JSON.stringify({ uz: '', ru: '', en: '' }),
        content: JSON.stringify({ uz: '', ru: '', en: '' }),
        images: '[]',
        techStack: '[]',
        liveUrl: '',
        githubUrl: '',
        featured: false,
        isVisible: true
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects')
            const data = await res.json()
            if (Array.isArray(data)) {
                setProjects(data)
            } else {
                console.error('Projects API returned non-array:', data)
                setProjects([])
            }
        } catch (error) {
            console.error(error)
            setProjects([])
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
            const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
            const method = editingProject ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingProject(null)
                resetForm()
                fetchProjects()
                modal.showSuccess('Muvaffaqiyatli', 'Loyiha saqlandi')
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
            "Loyihani o'chirishni tasdiqlaysizmi?",
            async () => {
                try {
                    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
                    fetchProjects()
                    modal.showSuccess('Muvaffaqiyatli', "Loyiha o'chirildi")
                } catch (error) {
                    console.error(error)
                    modal.showError('Xatolik', 'Xatolik yuz berdi')
                }
            },
            'danger'
        )
    }

    const openEdit = (project: Project) => {
        setEditingProject(project)
        setFormData({
            title: project.title,
            description: project.description,
            content: project.content,
            images: project.images, // keeping raw json string
            techStack: project.techStack, // keeping raw json string
            liveUrl: project.liveUrl || '',
            githubUrl: project.githubUrl || '',
            featured: project.featured,
            isVisible: project.isVisible
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: JSON.stringify({ uz: '', ru: '', en: '' }),
            description: JSON.stringify({ uz: '', ru: '', en: '' }),
            content: JSON.stringify({ uz: '', ru: '', en: '' }),
            images: '[]',
            techStack: '[]',
            liveUrl: '',
            githubUrl: '',
            featured: false,
            isVisible: true
        })
    }

    // Helper to edit Tech Stack as comma separated text
    const handleTechStackChange = (text: string) => {
        const arr = text.split(',').map(s => s.trim()).filter(s => s)
        setFormData({ ...formData, techStack: JSON.stringify(arr) })
    }

    const getTechStackText = () => {
        try {
            const arr = JSON.parse(formData.techStack)
            return Array.isArray(arr) ? arr.join(', ') : ''
        } catch { return '' }
    }

    // Helper for Images (simple URL list for now)
    const handleImagesChange = (text: string) => {
        // Assuming user enters one URL per line
        const arr = text.split('\n').map(s => s.trim()).filter(s => s)
        setFormData({ ...formData, images: JSON.stringify(arr) })
    }

    const getImagesText = () => {
        try {
            const arr = JSON.parse(formData.images)
            return Array.isArray(arr) ? arr.join('\n') : ''
        } catch { return '' }
    }


    const filteredProjects = projects.filter(p =>
        parseLocale(p.title).toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Loyihalar
                        </h1>
                        <p className="text-gray-500 mt-1">Portfolio loyihalarini boshqarish</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setEditingProject(null); setIsModalOpen(true) }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi qo'shish
                    </button>
                </div>

                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="search"
                        placeholder="Loyiha nomini izlash..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl"></div>)
                    ) : (
                        filteredProjects.map((project) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={project.id}
                                className="glass p-6 rounded-2xl border border-white/50 hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-2">
                                            {project.githubUrl && (
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                                                    <Github className="w-5 h-5" />
                                                </a>
                                            )}
                                            {project.liveUrl && (
                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                                                    <Globe className="w-5 h-5" />
                                                </a>
                                            )}
                                            {!project.githubUrl && !project.liveUrl && (
                                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                                    <Edit2 className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(project)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{parseLocale(project.title)}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                        {parseLocale(project.description)}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {JSON.parse(project.techStack).slice(0, 3).map((tech: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">{tech}</span>
                                        ))}
                                        {JSON.parse(project.techStack).length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">+{JSON.parse(project.techStack).length - 3}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        {project.isVisible ? (
                                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <Eye className="w-3 h-3" /> Visible
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                <EyeOff className="w-3 h-3" /> Hidden
                                            </span>
                                        )}
                                        {project.featured && (
                                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Featured</span>
                                        )}
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
                                className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl my-8 relative"
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition">
                                    <p className="text-xl">×</p>
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingProject ? 'Loyihani tahrirlash' : 'Yangi loyiha'}</h2>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <MultiLangInput
                                        label="Loyiha nomi"
                                        value={formData.title}
                                        onChange={v => setFormData({ ...formData, title: v })}
                                        required
                                    />

                                    <MultiLangInput
                                        label="Qisqacha tavsif"
                                        value={formData.description}
                                        onChange={v => setFormData({ ...formData, description: v })}
                                        type="textarea"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Texnologiyalar (vergul bilan ajrating)</label>
                                        <input
                                            type="text"
                                            value={getTechStackText()}
                                            onChange={e => handleTechStackChange(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="React, Next.js, TypeScript"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rasmlar (har bir qatorga bitta URL)</label>
                                        <textarea
                                            value={getImagesText()}
                                            onChange={e => handleImagesChange(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                            placeholder="https://example.com/image1.jpg"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                                            <input
                                                type="url"
                                                value={formData.liveUrl}
                                                onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                            <input
                                                type="url"
                                                value={formData.githubUrl}
                                                onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-6 pt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isVisible}
                                                onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="font-medium text-gray-700">Saytda ko'rinish</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="font-medium text-gray-700">Featured (Asosiy)</span>
                                        </label>
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
