'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle, XCircle, Calendar, Clock, User, Phone, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModal } from '@/contexts/ModalContext'
import { format } from 'date-fns'

interface Operation {
    id: string
    patientName: string
    patientPhone?: string
    operationType: string
    description?: string
    scheduledDate: string
    startTime: string
    endTime: string
    status: string
    outcome?: string
    notes?: string
}

export default function AdminOperationsPage() {
    const modal = useModal()
    const [operations, setOperations] = useState<Operation[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
    const [selectedOp, setSelectedOp] = useState<Operation | null>(null)

    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        operationType: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: ''
    })

    const [completeData, setCompleteData] = useState({
        outcome: 'SUCCESS',
        notes: ''
    })

    useEffect(() => {
        fetchOperations()
    }, [])

    const fetchOperations = async () => {
        try {
            const res = await fetch('/api/operations')
            const data = await res.json()
            setOperations(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            patientName: '',
            patientPhone: '',
            operationType: '',
            description: '',
            scheduledDate: '',
            startTime: '',
            endTime: ''
        })
    }

    const handleAdd = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                resetForm()
                fetchOperations()
                modal.showSuccess('Muvaffaqiyatli', 'Operatsiya qo\'shildi')
            } else {
                modal.showError('Xatolik', 'Operatsiyani qo\'shishda xatolik')
            }
        } catch (error) {
            console.error(error)
            modal.showError('Xatolik', 'Xatolik yuz berdi')
        }
    }

    const handleDelete = async (id: string) => {
        modal.showConfirm(
            "O'chirish",
            "Operatsiyani o'chirishni tasdiqlaysizmi?",
            async () => {
                try {
                    await fetch(`/api/operations/${id}`, { method: 'DELETE' })
                    fetchOperations()
                    modal.showSuccess('Muvaffaqiyatli', "Operatsiya o'chirildi")
                } catch (error) {
                    console.error(error)
                    modal.showError('Xatolik', 'Xatolik yuz berdi')
                }
            },
            'danger'
        )
    }

    const openCompleteModal = (op: Operation) => {
        setSelectedOp(op)
        setCompleteData({ outcome: 'SUCCESS', notes: '' })
        setIsCompleteModalOpen(true)
    }

    const handleComplete = async () => {
        if (!selectedOp) return

        try {
            const res = await fetch(`/api/operations/${selectedOp.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(completeData)
            })

            if (res.ok) {
                setIsCompleteModalOpen(false)
                setSelectedOp(null)
                fetchOperations()
                modal.showSuccess('Muvaffaqiyatli', 'Operatsiya yakunlandi va statistika yangilandi')
            } else {
                modal.showError('Xatolik', 'Operatsiyani yakunlashda xatolik')
            }
        } catch (error) {
            console.error(error)
            modal.showError('Xatolik', 'Xatolik yuz berdi')
        }
    }

    const getStatusBadge = (status: string, outcome?: string) => {
        if (status === 'COMPLETED') {
            return outcome === 'SUCCESS' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Muvaffaqiyatli
                </span>
            ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    Muvaffaqiyatsiz
                </span>
            )
        } else if (status === 'CANCELLED') {
            return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Bekor qilindi</span>
        } else {
            return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Rejalashtirilgan</span>
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Operatsiyalar
                        </h1>
                        <p className="text-gray-500 mt-1">Operatsiyalarni rejalashtirish va boshqarish</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Operatsiya qo'shish
                    </button>
                </div>

                {/* Operations List */}
                <div className="grid gap-6">
                    {operations.length === 0 ? (
                        <div className="glass p-12 rounded-2xl text-center">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Hozircha operatsiyalar yo'q</p>
                        </div>
                    ) : (
                        operations.map((op) => (
                            <motion.div
                                key={op.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-6 rounded-2xl hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold text-gray-900">{op.operationType}</h3>
                                            {getStatusBadge(op.status, op.outcome)}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="w-4 h-4" />
                                                <span>{op.patientName}</span>
                                            </div>
                                            {op.patientPhone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{op.patientPhone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(new Date(op.scheduledDate), 'dd MMM yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {format(new Date(op.startTime), 'HH:mm')} - {format(new Date(op.endTime), 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>

                                        {op.description && (
                                            <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                                                <FileText className="w-4 h-4 mt-0.5" />
                                                <span>{op.description}</span>
                                            </div>
                                        )}

                                        {op.notes && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                                <strong>Izohlar:</strong> {op.notes}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex md:flex-col gap-2">
                                        {op.status === 'SCHEDULED' && (
                                            <button
                                                type="button"
                                                onClick={() => openCompleteModal(op)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Yakunlash
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(op.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            O'chirish
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Operation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-bold mb-6">Operatsiya qo'shish</h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bemor ismi *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.patientName}
                                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefon raqami
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.patientPhone}
                                        onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Operatsiya turi *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.operationType}
                                        onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masalan: Buyrak toshi olib tashlash"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tavsif
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sana *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.scheduledDate}
                                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Boshlanish vaqti *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tugash vaqti *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                                    >
                                        Saqlash
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                        Bekor qilish
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Complete Operation Modal */}
            <AnimatePresence>
                {isCompleteModalOpen && selectedOp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setIsCompleteModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 max-w-md w-full"
                        >
                            <h2 className="text-2xl font-bold mb-6">Operatsiyani yakunlash</h2>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-2"><strong>Bemor:</strong> {selectedOp.patientName}</p>
                                <p className="text-gray-700"><strong>Operatsiya:</strong> {selectedOp.operationType}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Natija *
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setCompleteData({ ...completeData, outcome: 'SUCCESS' })}
                                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${completeData.outcome === 'SUCCESS'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                                            Muvaffaqiyatli
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCompleteData({ ...completeData, outcome: 'FAILED' })}
                                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${completeData.outcome === 'FAILED'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <XCircle className="w-5 h-5 mx-auto mb-1" />
                                            Muvaffaqiyatsiz
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Izohlar
                                    </label>
                                    <textarea
                                        value={completeData.notes}
                                        onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Qo'shimcha izohlar..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleComplete}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                                    >
                                        Yakunlash
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCompleteModalOpen(false)}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                        Bekor qilish
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
