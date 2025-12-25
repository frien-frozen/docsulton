'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CreditCard, Upload, Check, User, ArrowRight, ArrowLeft, CheckCircle2, Video, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import 'react-day-picker/dist/style.css'
import { auth, googleProvider } from '@/lib/firebase'
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'

interface Service {
    id: string
    name: string
    price: number
    duration: number
}

interface TimeSlot {
    id: string
    startTime: string
    endTime: string
    isBooked: boolean
}

export default function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
    const t = useTranslations('Booking')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: ''
    })
    const [services, setServices] = useState<Service[]>([])
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(false)
    const [locale, setLocale] = useState('')
    const [screenshots, setScreenshots] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [bookingId, setBookingId] = useState<string | null>(null)
    const [existingBooking, setExistingBooking] = useState<any>(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (currentUser && step === 1) {
                setFormData(prev => ({
                    ...prev,
                    name: currentUser.displayName || prev.name,
                }))
                // Check for existing booking
                checkExistingBooking(currentUser.email!)
            }
        })
        return () => unsubscribe()
    }, [step])

    // Check if user has existing booking
    const checkExistingBooking = async (userEmail: string) => {
        try {
            const res = await fetch(`/api/user/consultations?userEmail=${encodeURIComponent(userEmail)}`)
            if (res.ok) {
                const bookings = await res.json()
                // Find the most recent non-rejected booking
                const activeBooking = bookings.find((b: any) => b.status !== 'REJECTED')

                if (activeBooking) {
                    // User has an active booking (pending or approved)
                    setExistingBooking(activeBooking)
                    setShowStatusModal(true)
                    // Don't advance to step 2 - keep them on sign-in screen with modal
                } else {
                    // No active booking or only rejected bookings - allow booking
                    setTimeout(() => setStep(2), 1000)
                }
            } else {
                // Error fetching, proceed anyway
                setTimeout(() => setStep(2), 1000)
            }
        } catch (error) {
            console.error('Error checking booking:', error)
            setTimeout(() => setStep(2), 1000)
        }
    }

    const handleRebook = () => {
        setShowStatusModal(false)
        setExistingBooking(null)
        setStep(2) // Go to service selection
    }

    const handleNewBooking = () => {
        // For pending/approved bookings, just go home
        window.location.href = '/'
    }

    const handleDismissRejection = () => {
        // For rejected bookings, dismiss modal and allow rebooking
        setShowStatusModal(false)
        setExistingBooking(null)
        setStep(2)
    }


    useEffect(() => {
        params.then(p => {
            setLocale(p.locale)
            fetch('/api/services')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch services')
                    return res.json()
                })
                .then(data => {
                    if (!Array.isArray(data)) {
                        console.error('Expected array but got:', data)
                        return
                    }
                    const parsedServices = data.map((s: any) => ({
                        ...s,
                        name: JSON.parse(s.name)[p.locale] || JSON.parse(s.name)['uz'],
                        description: JSON.parse(s.description)[p.locale] || JSON.parse(s.description)['uz']
                    }))
                    setServices(parsedServices)
                })
                .catch(err => {
                    console.error('Error loading services:', err)
                })
        })
    }, [params])

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.error(error)
            alert('Login failed. Please try again.')
        }
    }

    useEffect(() => {
        if (selectedDate) {
            setSelectedSlot(null) // Reset selected slot when date changes
            fetch(`/api/slots?date=${selectedDate.toISOString()}`)
                .then(res => res.json())
                .then(data => setSlots(data))
        }
    }, [selectedDate])

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setUploading(true)
        try {
            // Upload all files
            const uploadedFiles: File[] = []
            for (const file of files) {
                const formData = new FormData()
                formData.append('file', file)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (res.ok) {
                    uploadedFiles.push(file)
                } else {
                    alert(`Failed to upload ${file.name}`)
                }
            }
            setScreenshots(prev => [...prev, ...uploadedFiles])
        } catch (error) {
            alert(tCommon('error'))
        } finally {
            setUploading(false)
        }
    }

    const removeFile = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index))
    }

    // Save details and go to payment (Step 4 -> Step 5)
    const handleSubmit = async () => {
        if (!user) {
            alert('Please login first')
            return
        }
        // Just move to payment step
        localStorage.setItem('userPhone', formData.phone)
        setStep(5)
    }

    const handlePaymentSubmit = async () => {
        if (screenshots.length === 0) {
            alert('Please upload at least one payment screenshot')
            return
        }
        setLoading(true)
        try {
            // Create the actual booking now
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: selectedService?.id,
                    slotId: selectedSlot?.id,
                    notes: formData.notes,
                    userEmail: user!.email,
                    userName: user!.displayName,
                    userImage: user!.photoURL
                })
            })

            if (res.ok) {
                const booking = await res.json()
                setBookingId(booking.id)

                // Update booking with payment screenshots
                const screenshotNames = screenshots.map(f => f.name)
                const updateRes = await fetch(`/api/bookings/${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentScreenshot: JSON.stringify(screenshotNames) // Store as JSON array
                    })
                })

                if (updateRes.ok) {
                    setStep(6) // Success page
                } else {
                    const error = await updateRes.json()
                    alert(error.error || tCommon('error'))
                }
            } else {
                const error = await res.json()
                alert(error.error || tCommon('error'))
            }
        } catch (error) {
            alert(tCommon('error'))
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { number: 1, title: 'Sign In', icon: User },
        { number: 2, title: t('selectService'), icon: Calendar },
        { number: 3, title: t('timeLabel'), icon: Clock },
        { number: 4, title: t('yourDetails'), icon: User },
        { number: 5, title: t('payment'), icon: CreditCard },
    ];

    return (
        <>
            {/* Consultation Status Modal */}
            {showStatusModal && existingBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                        {/* Approved Status */}
                        {existingBooking.status === 'APPROVED' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Konsultatsiya tasdiqlandi!</h2>
                                <p className="text-gray-600 mb-6">
                                    {JSON.parse(existingBooking.service.name)[locale] || JSON.parse(existingBooking.service.name)['uz']}
                                </p>

                                {/* Countdown Timer */}
                                <div className="bg-blue-50 p-6 rounded-xl mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Konsultatsiyagacha qolgan vaqt</p>
                                    <p className="text-4xl font-bold text-blue-600">
                                        {(() => {
                                            const now = new Date()
                                            const start = new Date(existingBooking.slot.startTime)
                                            const diff = start.getTime() - now.getTime()
                                            if (diff < 0) return 'Boshlandi'
                                            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                                            if (days > 0) return `${days} kun ${hours} soat`
                                            if (hours > 0) return `${hours} soat ${minutes} daqiqa`
                                            return `${minutes} daqiqa`
                                        })()}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {new Date(existingBooking.slot.startTime).toLocaleString('uz-UZ')}
                                    </p>
                                </div>

                                {/* Meeting Link */}
                                {existingBooking.meetingLink && (
                                    <Button
                                        onClick={() => window.open(existingBooking.meetingLink, '_blank')}
                                        variant="primary"
                                        className="w-full mb-4"
                                    >
                                        <Video className="w-5 h-5" />
                                        Google Meet ga kirish
                                    </Button>
                                )}

                                <Button onClick={handleNewBooking} variant="secondary" className="w-full">
                                    Bosh sahifaga qaytish
                                </Button>
                            </div>
                        )}

                        {/* Rejected Status */}
                        {existingBooking.status === 'REJECTED' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Konsultatsiya rad etildi</h2>
                                <p className="text-gray-600 mb-4">
                                    {JSON.parse(existingBooking.service.name)[locale] || JSON.parse(existingBooking.service.name)['uz']}
                                </p>

                                {/* Rejection Reason */}
                                {existingBooking.rejectionReason && (
                                    <div className="bg-red-50 p-4 rounded-xl mb-6 text-left">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Sabab:</p>
                                        <p className="text-gray-600">{existingBooking.rejectionReason}</p>
                                    </div>
                                )}

                                <Button onClick={handleDismissRejection} variant="primary" className="w-full">
                                    OK, Qayta buyurtma qilish
                                </Button>
                            </div>
                        )}

                        {/* Pending Status */}
                        {existingBooking.status === 'PENDING' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-12 h-12 text-yellow-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Arizangiz ko'rib chiqilmoqda</h2>
                                <p className="text-gray-600 mb-4">
                                    {JSON.parse(existingBooking.service.name)[locale] || JSON.parse(existingBooking.service.name)['uz']}
                                </p>

                                <div className="bg-yellow-50 p-4 rounded-xl mb-6">
                                    <p className="text-gray-700">
                                        Iltimos, admin javobini kuting. Tasdiqlangandan so'ng sizga xabar beramiz.
                                    </p>
                                </div>

                                <Button onClick={handleNewBooking} variant="secondary" className="w-full">
                                    Bosh sahifaga qaytish
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            <div className="min-h-screen gradient-soft pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Indicator */}
                    <div className="mb-12">
                        <div className="flex justify-between items-center relative">
                            {/* Progress Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                                ></div>
                            </div>

                            {steps.map((s) => {
                                const Icon = s.icon
                                const isActive = step >= s.number
                                const isCurrent = step === s.number

                                return (
                                    <div key={s.number} className="flex flex-col items-center gap-2 relative">
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                scale: isCurrent ? 1.1 : 1,
                                                backgroundColor: isActive ? '#3B82F6' : '#E5E7EB'
                                            }}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive ? 'text-white' : 'text-gray-400'
                                                }`}
                                        >
                                            {isActive && step > s.number ? (
                                                <CheckCircle2 className="w-7 h-7" />
                                            ) : (
                                                <Icon className="w-7 h-7" />
                                            )}
                                        </motion.div>
                                        <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'} hidden md:block`}>
                                            {s.title}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="glass-strong p-8 md:p-12 rounded-3xl shadow-xl">
                                {step === 1 && (
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold mb-3 gradient-text">Sign In</h2>
                                        <p className="text-gray-600 mb-8">Login with Google to start your booking</p>

                                        <div className="max-w-md mx-auto p-8 glass-light rounded-2xl border-2 border-blue-200">
                                            <div className="mb-6">
                                                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-10 h-10 text-blue-500" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Why Login?</h3>
                                                <p className="text-sm text-gray-600">Your account helps us verify your identity and manage your bookings efficiently.</p>
                                            </div>

                                            <div className="flex justify-center">
                                                <Button
                                                    onClick={handleGoogleLogin}
                                                    variant="primary"
                                                    className="w-full flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                    </svg>
                                                    Sign in with Google
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-3 gradient-text">{t('selectService')}</h2>
                                        <p className="text-gray-600 mb-8">{t('selectServiceSubtitle')}</p>

                                        <div className="grid gap-6">
                                            {services.map((service) => (
                                                <motion.div
                                                    key={service.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSelectedService(service)}
                                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedService?.id === service.id
                                                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center pr-12">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-xl mb-2 text-gray-900">{service.name}</h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {service.duration} {t('duration')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-3xl font-bold text-blue-600">{service.price.toLocaleString()}</div>
                                                            <div className="text-sm text-gray-500">{t('price')}</div>
                                                        </div>
                                                    </div>
                                                    {selectedService?.id === service.id && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                                                        >
                                                            <Check className="w-5 h-5 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button onClick={handleBack} variant="secondary" className="btn-ghost">
                                                <ArrowLeft className="w-5 h-5" />
                                                {tCommon('back')}
                                            </Button>
                                            <Button onClick={handleNext} disabled={!selectedService} variant="primary" className="btn-lg">
                                                {tCommon('next')}
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-3 gradient-text">{t('selectTime')}</h2>
                                        <p className="text-gray-600 mb-8">{t('selectTimeSubtitle')}</p>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="glass-light p-6 rounded-2xl">
                                                <h3 className="font-semibold mb-4 text-gray-900">{t('selectDate')}</h3>
                                                <DayPicker
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={setSelectedDate}
                                                    disabled={{ before: new Date() }}
                                                    fromDate={new Date()}
                                                    className="!bg-transparent"
                                                />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-4 text-gray-900">{t('availableTimes')}</h3>
                                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                    {slots.length === 0 ? (
                                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                            <p className="text-gray-500 font-medium">No available times for this date</p>
                                                            <p className="text-sm text-gray-400 mt-1">Please select another date</p>
                                                        </div>
                                                    ) : (
                                                        slots.map((slot) => (
                                                            <motion.button
                                                                key={slot.id}
                                                                whileHover={{ scale: slot.isBooked ? 1 : 1.02 }}
                                                                whileTap={{ scale: slot.isBooked ? 1 : 0.98 }}
                                                                disabled={slot.isBooked}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${slot.isBooked
                                                                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                                                                    : selectedSlot?.id === slot.id
                                                                        ? 'border-green-500 bg-green-50 shadow-md'
                                                                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${slot.isBooked ? 'bg-gray-200' : selectedSlot?.id === slot.id ? 'bg-green-500' : 'bg-blue-100'
                                                                        }`}>
                                                                        <Clock className={`w-5 h-5 ${slot.isBooked ? 'text-gray-400' : selectedSlot?.id === slot.id ? 'text-white' : 'text-blue-600'
                                                                            }`} />
                                                                    </div>
                                                                    <span className="font-semibold text-gray-900">{format(new Date(slot.startTime), 'HH:mm')}</span>
                                                                </div>
                                                                {slot.isBooked ? (
                                                                    <span className="badge badge-error">{t('booked')}</span>
                                                                ) : (
                                                                    <span className="badge badge-success">{t('available')}</span>
                                                                )}
                                                            </motion.button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button onClick={handleBack} variant="secondary" className="btn-ghost">
                                                <ArrowLeft className="w-5 h-5" />
                                                {tCommon('back')}
                                            </Button>
                                            <Button onClick={handleNext} disabled={!selectedSlot} variant="primary">
                                                {tCommon('next')}
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}


                                {step === 4 && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-3 gradient-text">{t('yourDetails')}</h2>
                                        <p className="text-gray-600 mb-8">{t('enterDetailsSubtitle')}</p>

                                        {/* Show logged in user */}
                                        {user && (
                                            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                                                {user.photoURL && (
                                                    <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{user.displayName}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phoneLabel')} *</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="input-field"
                                                    placeholder="+998 90 123 45 67"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('notesLabel')}</label>
                                                <textarea
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    className="input-field"
                                                    rows={4}
                                                    placeholder={t('notesPlaceholder')}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button onClick={handleBack} variant="secondary" className="btn-ghost">
                                                <ArrowLeft className="w-5 h-5" />
                                                {tCommon('back')}
                                            </Button>
                                            <Button onClick={handleSubmit} disabled={!formData.phone} loading={loading} variant="primary">
                                                {tCommon('next')}
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-3 gradient-text">{t('payment')}</h2>
                                        <p className="text-gray-600 mb-8">{t('paymentSubtitle')}</p>

                                        <div className="glass-light p-8 rounded-2xl mb-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-gray-600">{t('paymentAmount')}</span>
                                                <span className="text-4xl font-bold gradient-text">{selectedService?.price.toLocaleString()} {t('price')}</span>
                                            </div>

                                            <div className="border-t border-gray-200 pt-6">
                                                <p className="font-bold mb-3 text-gray-900">{t('cardNumber')}</p>
                                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-blue-200">
                                                    <CreditCard className="w-8 h-8 text-blue-600" />
                                                    <span className="text-2xl font-mono font-bold text-gray-900">8600 0000 0000 0000</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-3">{t('cardHolder')}</p>
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                    <p className="font-semibold text-gray-900 mb-2">Uploading...</p>
                                                </>
                                            ) : screenshots.length > 0 ? (
                                                <>
                                                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                                                    <p className="font-semibold text-gray-900 mb-2">{screenshots.length} Screenshot(s) Uploaded</p>
                                                    <p className="text-xs text-blue-600 mt-2">Click to add more</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-16 h-16 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                                    <p className="font-semibold text-gray-900 mb-2">{t('uploadScreenshot')}</p>
                                                    <p className="text-sm text-gray-500">Select multiple files</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Display uploaded files */}
                                        {screenshots.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {screenshots.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            <span className="text-sm text-gray-700">{file.name}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-8 flex justify-between">
                                            <Button onClick={handleBack} variant="secondary" className="btn-ghost">
                                                <ArrowLeft className="w-5 h-5" />
                                                {tCommon('back')}
                                            </Button>
                                            <Button onClick={handlePaymentSubmit} loading={loading} variant="primary" disabled={screenshots.length === 0}>
                                                {t('submit')}
                                                <Check className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 6 && (
                                    <div className="text-center py-12">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", duration: 0.6 }}
                                            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                                        >
                                            <Check className="w-12 h-12 text-white" />
                                        </motion.div>

                                        <h2 className="text-4xl font-bold mb-4 gradient-text">{t('successTitle')}</h2>
                                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                                            {t('successMessage')}
                                        </p>

                                        <div className="glass-light p-6 rounded-2xl max-w-md mx-auto mb-8">
                                            <div className="space-y-3 text-left">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{t('serviceLabel')}</span>
                                                    <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{t('dateLabel')}</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {selectedDate && format(selectedDate, 'dd.MM.yyyy')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{t('timeLabel')}</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {selectedSlot && format(new Date(selectedSlot.startTime), 'HH:mm')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">{t('statusLabel')}</span>
                                                    <span className="badge badge-warning">{t('pending')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 justify-center">
                                            <Button
                                                onClick={() => router.push(`/${locale}/dashboard`)}
                                                variant="primary"
                                                className="btn-lg"
                                            >
                                                Go to Dashboard
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                onClick={() => window.location.reload()}
                                                variant="secondary"
                                                className="btn-lg btn-ghost"
                                            >
                                                Book Another
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}
