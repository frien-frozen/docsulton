'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Check, X, Video, FileText, Plus, Search, User, Phone, MessageSquare, RefreshCw, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '@/components/ConfirmModal'

interface Booking {
    id: string
    user: { username: string; phone: string; telegramId: string }
    service: { name: string; price: number }
    slot: { startTime: string; endTime: string }
    status: string
    paymentStatus: string
    paymentScreenshot?: string
    notes?: string
    meetingLink?: string
}

interface Service {
    id: string
    name: string
    price: number
}

interface Slot {
    id: string
    startTime: string
    endTime: string
    isBooked: boolean
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [slots, setSlots] = useState<Slot[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedScreenshots, setSelectedScreenshots] = useState<string[]>([])
    const [showScreenshotsModal, setShowScreenshotsModal] = useState(false)

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        onConfirm: () => void
        type: 'danger' | 'warning' | 'success' | 'info'
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    })

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        serviceId: '',
        slotId: '',
        notes: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // First, auto-complete any expired consultations
            await fetch('/api/bookings/complete-expired', { method: 'POST' })

            const [bookingsRes, servicesRes, slotsRes] = await Promise.all([
                fetch('/api/bookings/all'),
                fetch('/api/services'),
                fetch('/api/slots?date=' + new Date().toISOString())
            ])

            const bookingsData = await bookingsRes.json()
            const servicesData = await servicesRes.json()
            const slotsData = await slotsRes.json()

            // Parse multilingual service names for list
            const parsedBookings = Array.isArray(bookingsData) ? bookingsData.map((b: any) => ({
                ...b,
                service: {
                    ...b.service,
                    name: parseLocaleString(b.service.name)
                }
            })) : []

            const parsedServices = Array.isArray(servicesData) ? servicesData.map((s: any) => ({
                ...s,
                name: parseLocaleString(s.name)
            })) : []

            setBookings(parsedBookings)
            setServices(parsedServices)
            setSlots(Array.isArray(slotsData) ? slotsData : [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const parseLocaleString = (jsonString: string) => {
        try {
            const obj = JSON.parse(jsonString)
            return obj['uz'] || Object.values(obj)[0]
        } catch (e) {
            return jsonString
        }
    }

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            setIsModalOpen(false)
            setFormData({ name: '', phone: '', serviceId: '', slotId: '', notes: '' })
            fetchData() // Refresh list
            fetchData() // Refresh list
        } catch (error: any) {
            console.error(error)
            alert('Xatolik yuz berdi: ' + (error.message || 'Unknown error'))
        }
    }

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                fetchData()
            } else {
                const err = await res.json()
                alert('Xatolik: ' + (err.error || 'Server error'))
            }
        } catch (error: any) {
            alert('Xatolik: ' + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "O'chirish",
            message: "Bu buyurtma va bog'langan vaqt sloti o'chiriladi. Davom etasizmi?",
            type: 'danger',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/bookings/${id}`, {
                        method: 'DELETE'
                    })
                    if (res.ok) {
                        fetchData()
                        setConfirmModal({
                            isOpen: true,
                            title: 'Muvaffaqiyatli',
                            message: "Buyurtma muvaffaqiyatli o'chirildi",
                            type: 'success',
                            onConfirm: () => { }
                        })
                    } else {
                        const err = await res.json()
                        setConfirmModal({
                            isOpen: true,
                            title: 'Xatolik',
                            message: err.error || 'Server error',
                            type: 'danger',
                            onConfirm: () => { }
                        })
                    }
                } catch (error: any) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Xatolik',
                        message: error.message,
                        type: 'danger',
                        onConfirm: () => { }
                    })
                }
            }
        })
    }

    const handleGenerateSlots = async () => {
        setConfirmModal({
            isOpen: true,
            title: 'Vaqtlarni yangilash',
            message: 'Keyingi 30 kun uchun vaqt slotlarini yaratmoqchimisiz?',
            type: 'info',
            onConfirm: async () => {
                setLoading(true)
                try {
                    const res = await fetch('/api/slots/generate', { method: 'POST' })
                    if (res.ok) {
                        fetchData()
                        setConfirmModal({
                            isOpen: true,
                            title: 'Muvaffaqiyatli',
                            message: 'Vaqtlar muvaffaqiyatli yaratildi',
                            type: 'success',
                            onConfirm: () => { }
                        })
                    } else {
                        const errorData = await res.json()
                        setConfirmModal({
                            isOpen: true,
                            title: 'Xatolik',
                            message: errorData.error || 'Unknown error',
                            type: 'danger',
                            onConfirm: () => { }
                        })
                    }
                } catch (error: any) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Xatolik',
                        message: error.message,
                        type: 'danger',
                        onConfirm: () => { }
                    })
                } finally {
                    setLoading(false)
                }
            }
        })
    }

    const filteredBookings = bookings.filter(b =>
        b.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user?.phone?.includes(searchTerm)
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Konsultatsiyalar
                        </h1>
                        <p className="text-gray-500 mt-1">Barcha buyurtmalar va ro'yxatga olish</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleGenerateSlots}
                            className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-semibold hover:bg-blue-50 transition shadow-sm flex items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Vaqtlarni yangilash
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Yangi qo'shish
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="search"
                        placeholder="Ism yoki telefon orqali izlash..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                    />
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border border-gray-100">
                            <p className="text-gray-500">Buyurtmalar topilmadi</p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={booking.id}
                                className="glass p-6 rounded-2xl border border-white/50 hover:border-blue-200 transition-all duration-300 group"
                            >
                                <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                booking.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                {booking.status === 'PENDING' ? 'Kutilmoqda' :
                                                    booking.status === 'APPROVED' ? 'Tasdiqlandi' :
                                                        booking.status === 'COMPLETED' ? 'Yakunlandi' : 'Bekor qilindi'}
                                            </span>
                                            <span className="text-gray-400 text-xs font-mono">#{booking.id.slice(-6)}</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900">{booking.service.name}</h3>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">{format(new Date(booking.slot.startTime), 'dd.MM.yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg text-purple-700">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">{format(new Date(booking.slot.startTime), 'HH:mm')}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-6 pt-3 border-t border-gray-100/50">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{booking.user.username}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{booking.user.phone}</span>
                                            </div>
                                            {booking.notes && (
                                                <div className="flex items-center gap-2 text-gray-500 italic max-w-md">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="truncate">{booking.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full lg:w-auto">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button type="button" onClick={() => updateStatus(booking.id, 'APPROVED')}
                                                    className="flex-1 lg:flex-none px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition flex items-center justify-center gap-2 font-medium">
                                                    <Check className="w-4 h-4" /> Tasdiqlash
                                                </button>
                                                <button type="button" onClick={() => updateStatus(booking.id, 'REJECTED')}
                                                    className="flex-1 lg:flex-none px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition flex items-center justify-center gap-2 font-medium">
                                                    <X className="w-4 h-4" /> Bekor qilish
                                                </button>
                                            </>
                                        )}
                                        {booking.paymentScreenshot && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    try {
                                                        const screenshots = JSON.parse(booking.paymentScreenshot!)
                                                        if (Array.isArray(screenshots)) {
                                                            setSelectedScreenshots(screenshots)
                                                            setShowScreenshotsModal(true)
                                                        } else {
                                                            // Single screenshot (old format)
                                                            window.open(booking.paymentScreenshot, '_blank')
                                                        }
                                                    } catch {
                                                        // Not JSON, treat as single URL
                                                        window.open(booking.paymentScreenshot, '_blank')
                                                    }
                                                }}
                                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center gap-2 font-medium"
                                            >
                                                <FileText className="w-4 h-4" /> Chek
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(booking.id)}
                                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex items-center gap-2 font-medium"
                                            title="O'chirish"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {booking.meetingLink && (
                                            <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer"
                                                className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition flex items-center gap-2 font-medium"
                                                title="Video konsultatsiyaga kirish"
                                            >
                                                <Video className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Registration Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Yangi buyurtma</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateBooking} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mijo Ismi</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Ism Familiya"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <input
                                            type="tel" required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="+998 90 123 45 67"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat turi</label>
                                        <select
                                            required
                                            value={formData.serviceId}
                                            onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="">Xizmatni tanlang</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} - {s.price.toLocaleString()} UZS</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vaqt</label>
                                        <select
                                            required
                                            value={formData.slotId}
                                            onChange={e => setFormData({ ...formData, slotId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="">Vaqtni tanlang</option>
                                            {slots.filter(s => !s.isBooked).map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {format(new Date(s.startTime), 'dd.MM.yyyy HH:mm')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Izoh (ixtiyoriy)</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={2}
                                        />
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

                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                />

                {/* Screenshots Modal */}
                <AnimatePresence>
                    {showScreenshotsModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">To'lov cheklari ({selectedScreenshots.length} ta)</h2>
                                    <button onClick={() => setShowScreenshotsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {selectedScreenshots.map((screenshot, index) => (
                                        <a
                                            key={index}
                                            href={screenshot}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                                        >
                                            <FileText className="w-6 h-6 text-blue-600" />
                                            <span className="font-medium text-gray-900">Chek #{index + 1}</span>
                                            <span className="text-sm text-gray-500 truncate flex-1">{screenshot.split('/').pop()}</span>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
