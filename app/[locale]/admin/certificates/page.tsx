'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MultiLangInput from '@/components/ui/MultiLangInput'
import { format } from 'date-fns'
import { useModal } from '@/contexts/ModalContext'

interface Certificate {
    id: string
    title: string // JSON
    description: string // JSON (optional)
    imageUrl: string
    issuedBy: string
    issuedDate: string
    isVisible: boolean
}

export default function AdminCertificatesPage() {
    const modal = useModal()
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCert, setEditingCert] = useState<Certificate | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: JSON.stringify({ uz: '', ru: '', en: '' }),
        description: JSON.stringify({ uz: '', ru: '', en: '' }),
        imageUrl: '',
        issuedBy: '',
        issuedDate: '',
        isVisible: true
    })

    useEffect(() => {
        fetchCertificates()
    }, [])

    const fetchCertificates = async () => {
        try {
            const res = await fetch('/api/certificates')
            const data = await res.json()
            setCertificates(data)
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
            const url = editingCert ? `/api/certificates/${editingCert.id}` : '/api/certificates'
            const method = editingCert ? 'PUT' : 'POST'

            // Build Date object or string if needed, API likely expects ISO string or Date
            // Ensure date is handled if API expects it
            const payload = {
                ...formData,
                issuedDate: formData.issuedDate ? new Date(formData.issuedDate).toISOString() : null
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingCert(null)
                resetForm()
                fetchCertificates()
                modal.showSuccess('Muvaffaqiyatli', 'Sertifikat saqlandi')
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
            "Sertifikatni o'chirishni tasdiqlaysizmi?",
            async () => {
                try {
                    await fetch(`/api/certificates/${id}`, { method: 'DELETE' })
                    fetchCertificates()
                    modal.showSuccess('Muvaffaqiyatli', "Sertifikat o'chirildi")
                } catch (error) {
                    console.error(error)
                    modal.showError('Xatolik', 'Xatolik yuz berdi')
                }
            },
            'danger'
        )
    }

    const openEdit = (cert: Certificate) => {
        setEditingCert(cert)
        setFormData({
            title: cert.title,
            description: cert.description || JSON.stringify({ uz: '', ru: '', en: '' }),
            imageUrl: cert.imageUrl,
            issuedBy: cert.issuedBy || '',
            issuedDate: cert.issuedDate ? format(new Date(cert.issuedDate), 'yyyy-MM-dd') : '',
            isVisible: cert.isVisible
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: JSON.stringify({ uz: '', ru: '', en: '' }),
            description: JSON.stringify({ uz: '', ru: '', en: '' }),
            imageUrl: '',
            issuedBy: '',
            issuedDate: '',
            isVisible: true
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Sertifikatlar
                        </h1>
                        <p className="text-gray-500 mt-1">Sertifikat va diplomlarni boshqarish</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setEditingCert(null); setIsModalOpen(true) }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi qo'shish
                    </button>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl break-inside-avoid"></div>)
                    ) : (
                        certificates.map((cert) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={cert.id}
                                className="glass rounded-2xl border border-white/50 hover:border-blue-200 transition-all duration-300 group overflow-hidden break-inside-avoid shadow-sm hover:shadow-md"
                            >
                                <div className="relative aspect-[4/3] bg-gray-100">
                                    <img src={cert.imageUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => openEdit(cert)} className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(cert.id)} className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 mb-1">{parseLocale(cert.title)}</h3>
                                    <p className="text-gray-500 text-sm mb-3">{parseLocale(cert.description)}</p>

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-gray-400">
                                        <span>{cert.issuedBy}</span>
                                        <span>{cert.issuedDate ? format(new Date(cert.issuedDate), 'dd.MM.yyyy') : ''}</span>
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
                                className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl my-8 relative"
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition">
                                    <p className="text-xl">×</p>
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingCert ? 'Sertifikatni tahrirlash' : 'Yangi sertifikat'}</h2>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <MultiLangInput
                                        label="Nomi (Title)"
                                        value={formData.title}
                                        onChange={v => setFormData({ ...formData, title: v })}
                                        required
                                    />

                                    <MultiLangInput
                                        label="Tavsif (Description)"
                                        value={formData.description}
                                        onChange={v => setFormData({ ...formData, description: v })}
                                        type="textarea"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rasm URL</label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kim tomonidan</label>
                                            <input
                                                type="text"
                                                value={formData.issuedBy}
                                                onChange={e => setFormData({ ...formData, issuedBy: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
                                            <input
                                                type="date"
                                                value={formData.issuedDate}
                                                onChange={e => setFormData({ ...formData, issuedDate: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVisible}
                                            onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-gray-700">Saytda ko'rinish</span>
                                    </label>

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
