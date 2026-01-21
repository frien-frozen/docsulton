'use client'

import { useState, useEffect } from 'react'
import { Mail, MailOpen, Trash2, Clock, User, Phone, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { useModal } from '@/contexts/ModalContext'

interface Message {
    id: string
    name: string
    email: string
    phone: string | null
    subject: string | null
    message: string
    isRead: boolean
    createdAt: string
}

export default function NotificationsPage() {
    const modal = useModal()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messages')
            const data = await res.json()
            if (Array.isArray(data)) {
                setMessages(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true })
            })
            fetchMessages()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (id: string) => {
        modal.showConfirm(
            "O'chirish",
            "Xabarni o'chirishni tasdiqlaysizmi?",
            async () => {
                try {
                    await fetch(`/api/messages/${id}`, { method: 'DELETE' })
                    if (selectedMessage?.id === id) {
                        setSelectedMessage(null)
                    }
                    fetchMessages()
                    modal.showSuccess('Muvaffaqiyatli', "Xabar o'chirildi")
                } catch (error) {
                    console.error(error)
                    modal.showError('Xatolik', 'Xatolik yuz berdi')
                }
            },
            'danger'
        )
    }

    const openMessage = (msg: Message) => {
        setSelectedMessage(msg)
        if (!msg.isRead) {
            markAsRead(msg.id)
        }
    }

    const unreadCount = messages.filter(m => !m.isRead).length
    const filteredMessages = filter === 'unread'
        ? messages.filter(m => !m.isRead)
        : messages

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Xabarlar
                </h1>
                <p className="text-gray-500 mt-1">Kontakt sahifasidan kelgan xabarlar</p>
            </div>

            <div className="flex gap-6">
                {/* Messages List */}
                <div className="w-full lg:w-1/2 space-y-4">
                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Hammasi ({messages.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${filter === 'unread'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            O'qilmagan
                            {unreadCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${filter === 'unread' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                                    }`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {filteredMessages.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>Xabarlar yo'q</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredMessages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => openMessage(msg)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedMessage?.id === msg.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : msg.isRead
                                                ? 'border-gray-100 bg-white hover:border-gray-200'
                                                : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${msg.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                            {msg.isRead ? (
                                                <MailOpen className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={`font-semibold truncate ${msg.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {msg.name}
                                                </h3>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {format(new Date(msg.createdAt), 'dd MMM', { locale: uz })}
                                                </span>
                                            </div>
                                            {msg.subject && (
                                                <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                                            )}
                                            <p className="text-sm text-gray-500 truncate mt-1">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <div className="hidden lg:block w-1/2">
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div
                                key={selectedMessage.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {selectedMessage.subject || 'Xabar'}
                                    </h2>
                                    <button
                                        onClick={() => handleDelete(selectedMessage.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3 text-sm">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{selectedMessage.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                    {selectedMessage.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                                                {selectedMessage.phone}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        {format(new Date(selectedMessage.createdAt), "d MMMM yyyy, HH:mm", { locale: uz })}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Xabar'}`}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Javob yozish
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-96 flex flex-col items-center justify-center text-gray-400"
                            >
                                <Mail className="w-16 h-16 mb-4 opacity-30" />
                                <p>Xabarni tanlang</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Message Detail Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {selectedMessage.subject || 'Xabar'}
                                </h2>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{selectedMessage.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span>{selectedMessage.email}</span>
                                </div>
                                {selectedMessage.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{selectedMessage.phone}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-700 whitespace-pre-wrap mb-6">
                                {selectedMessage.message}
                            </p>

                            <div className="flex gap-3">
                                <a
                                    href={`mailto:${selectedMessage.email}`}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-center"
                                >
                                    Javob yozish
                                </a>
                                <button
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="px-4 py-3 bg-red-50 text-red-600 rounded-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
