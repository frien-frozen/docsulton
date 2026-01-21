'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, Copy, CheckCircle, AlertCircle, ExternalLink, Heart, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { Button } from '@/components/ui/Button'

interface Booking {
    id: string
    service: { name: string; price: number }
    slot: { startTime: string; endTime: string }
    status: string
    paymentStatus: string
    meetingLink?: string
}

export default function DashboardPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('Dashboard')
    const locale = useLocale()
    const router = useRouter()
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [timeUntil, setTimeUntil] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (!currentUser) {
                router.push(`/${locale}/consultation`)
            }
        })
        return () => unsubscribe()
    }, [router, locale])

    useEffect(() => {
        if (user) {
            fetchBookings()
        }
    }, [user, locale])

    const fetchBookings = async () => {
        if (!user?.email) return

        try {
            const res = await fetch(`/api/user/consultations?userEmail=${encodeURIComponent(user.email)}`)
            if (res.ok) {
                const data = await res.json()
                // Transform data to match interface and localize
                const formattedBookings = data.map((b: any) => ({
                    ...b,
                    service: {
                        ...b.service,
                        name: getLocalizedContent(b.service.name)
                    }
                }))
                setBookings(formattedBookings)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    // Update countdown timers every minute
    useEffect(() => {
        const updateTimers = () => {
            const newTimeUntil: { [key: string]: string } = {}
            bookings.forEach(booking => {
                const now = new Date()
                const start = new Date(booking.slot.startTime)
                const diff = start.getTime() - now.getTime()

                if (diff < 0) {
                    newTimeUntil[booking.id] = 'Started'
                } else {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

                    if (days > 0) newTimeUntil[booking.id] = `${days}d ${hours}h`
                    else if (hours > 0) newTimeUntil[booking.id] = `${hours}h ${minutes}m`
                    else newTimeUntil[booking.id] = `${minutes}m`
                }
            })
            setTimeUntil(newTimeUntil)
        }

        updateTimers()
        const interval = setInterval(updateTimers, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [bookings])

    const getLocalizedContent = (jsonString: string) => {
        try {
            const content = JSON.parse(jsonString)
            return content[locale] || content['uz'] || ''
        } catch (e) {
            return jsonString
        }
    }

    const copyMeetingLink = (link: string, id: string) => {
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">{t('status.APPROVED')}</span>
            case 'PENDING':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">{t('status.PENDING')}</span>
            case 'REJECTED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">{t('status.REJECTED')}</span>
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>
        }
    }

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">{t('payment.VERIFIED')}</span>
            case 'PENDING':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">{t('payment.PENDING')}</span>
            case 'REJECTED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">{t('payment.REJECTED')}</span>
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>
        }
    }

    return (
        <div className="min-h-screen gradient-soft pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-none">
                    <div className="flex items-center gap-6">
                        {/* Distinct Icon */}
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-100 border border-blue-50">
                            <Heart className="w-9 h-9 text-blue-600 fill-blue-50" />
                        </div>

                        {/* Separated Text Elements */}
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                {t('title')}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                                <p className="text-gray-500 font-medium">{t('subtitle')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
                                <div className="text-sm text-gray-600">{t('stats.total')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">
                                    {bookings.filter(b => b.status === 'APPROVED').length}
                                </div>
                                <div className="text-sm text-gray-600">{t('stats.approved')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-7 h-7 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">
                                    {bookings.filter(b => b.status === 'PENDING').length}
                                </div>
                                <div className="text-sm text-gray-600">{t('stats.pending')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Booking Button */}
                <div className="mb-8 flex justify-end">
                    <Button
                        onClick={() => router.push(`/${locale}/consultation`)}
                        variant="primary"
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Booking
                    </Button>
                </div>

                {/* Upcoming Consultations */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">{t('upcoming')}</h2>

                    <div className="grid gap-6">
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        {/* Left Section */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Video className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.service.name}</h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            {format(new Date(booking.slot.startTime), 'dd MMMM yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {format(new Date(booking.slot.startTime), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Countdown Timer */}
                                            {booking.status === 'APPROVED' && timeUntil[booking.id] && (
                                                <div className="mt-4 bg-blue-50 p-4 rounded-xl inline-block pr-8">
                                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Boshlanishiga</p>
                                                    <p className="text-2xl font-bold text-blue-700 font-mono">
                                                        {timeUntil[booking.id]}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {getStatusBadge(booking.status)}
                                                {/* Only show payment badge if it's different/relevant, otherwise it's redundant */}
                                                {booking.paymentStatus !== booking.status && getPaymentBadge(booking.paymentStatus)}
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div className="flex flex-col gap-3 md:items-end justify-between">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {booking.service.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">UZS</span>
                                                </div>
                                            </div>

                                            {booking.meetingLink && booking.status === 'APPROVED' && (
                                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                                    <a
                                                        href={booking.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        {t('actions.join')}
                                                    </a>

                                                    <button
                                                        onClick={() => copyMeetingLink(booking.meetingLink!, booking.id)}
                                                        className="px-6 py-2 text-sm text-gray-500 hover:text-gray-700 transition flex items-center justify-center gap-2"
                                                    >
                                                        {copiedId === booking.id ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                {t('actions.copied')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3 h-3" />
                                                                {t('actions.copyLink')}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {booking.status === 'PENDING' && (
                                                <div className="bg-orange-50 p-4 rounded-xl text-sm text-orange-700 max-w-xs border border-orange-100 flex gap-3">
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                    <p>{t('pendingMessage')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {bookings.length === 0 && (
                    <div className="glass-light p-12 rounded-3xl text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('empty.title')}</h3>
                        <p className="text-gray-600 mb-6">{t('empty.desc')}</p>
                        <a href="/consultation" className="btn btn-primary inline-flex">
                            <Calendar className="w-5 h-5" />
                            {t('empty.button')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
