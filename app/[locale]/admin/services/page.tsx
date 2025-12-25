'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff, Clock, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MultiLangInput from '@/components/ui/MultiLangInput'
import { useModal } from '@/contexts/ModalContext'

interface Service {
    id: string
    name: string // JSON
    description: string // JSON
    duration: number
    price: number
    currency: string
    isVisible: boolean
}

export default function AdminServicesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const modal = useModal()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login')
        }
    }, [status, router])

    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)

    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
    if (!session) return null

    // Form State
    const [formData, setFormData] = useState({
        name: JSON.stringify({ uz: '', ru: '', en: '' }),
        description: JSON.stringify({ uz: '', ru: '', en: '' }),
        duration: 30,
        price: 0,
        isVisible: true
    })

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services?all=true')
            const data = await res.json()
            setServices(data)
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
            const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
            const method = editingService ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingService(null)
                resetForm()
                fetchServices()
                modal.showSuccess('Muvaffaqiyatli', 'Xizmat saqlandi')
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
            "Agar xizmatga bog'langan buyurtmalar bo'lsa, o'chirib bo'lmaydi. Davom etasizmi?",
            async () => {
                try {
                    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
                    if (res.ok) {
                        fetchServices()
                        modal.showSuccess('Muvaffaqiyatli', "Xizmat o'chirildi")
                    } else {
                        const data = await res.json()
                        modal.showError('Xatolik', data.error || 'Xatolik')
                    }
                } catch (error) {
                    console.error(error)
                    modal.showError('Xatolik', 'Xatolik yuz berdi')
                }
            },
            'danger'
        )
    }

    const openEdit = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description || JSON.stringify({ uz: '', ru: '', en: '' }),
            duration: service.duration,
            price: service.price,
            isVisible: service.isVisible
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            name: JSON.stringify({ uz: '', ru: '', en: '' }),
            description: JSON.stringify({ uz: '', ru: '', en: '' }),
            duration: 30,
            price: 0,
            isVisible: true
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Xizmatlar
                        </h1>
                        <p className="text-gray-500 mt-1">Konsultatsiya xizmatlarini boshqarish</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setEditingService(null); setIsModalOpen(true) }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi qo'shish
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-40 bg-white/50 animate-pulse rounded-2xl"></div>)
                    ) : (
                        services.map((service) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={service.id}
                                className="glass p-6 rounded-2xl border border-white/50 hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(service)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{parseLocale(service.name)}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                        {parseLocale(service.description)}
                                    </p>

                                    <div className="flex gap-4 text-sm font-medium text-gray-600">
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3" /> {service.duration} min
                                        </span>
                                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                                            {service.price.toLocaleString()} UZS
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                                    {service.isVisible ? (
                                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            <Eye className="w-3 h-3" /> Visible
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            <EyeOff className="w-3 h-3" /> Hidden
                                        </span>
                                    )}
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

                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingService ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</h2>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <MultiLangInput
                                        label="Xizmat nomi"
                                        value={formData.name}
                                        onChange={v => setFormData({ ...formData, name: v })}
                                        required
                                    />

                                    <MultiLangInput
                                        label="Tavsif"
                                        value={formData.description}
                                        onChange={v => setFormData({ ...formData, description: v })}
                                        type="textarea"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Narx (UZS)</label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Davomiyligi (daq)</label>
                                            <input
                                                type="number"
                                                value={formData.duration}
                                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
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
