'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CreditCard, Upload, Check, User, ArrowRight, ArrowLeft, CheckCircle2, Video, XCircle, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import 'react-day-picker/dist/style.css'
import { auth, googleProvider } from '@/lib/firebase'
import { uploadToFirebase } from '@/lib/storage'
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

export default function BookingPage() {
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
    const [screenshots, setScreenshots] = useState<File[]>([])
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [bookingId, setBookingId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                setFormData(prev => ({
                    ...prev,
                    name: currentUser.displayName || prev.name,
                }))
            }
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        const currentLocale = 'uz'
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
                // Handle both JSON strings and plain strings for compatibility
                const parsedServices = data.map((s: any) => {
                    let name = s.name
                    let description = s.description

                    try {
                        const nameObj = JSON.parse(s.name)
                        name = nameObj[currentLocale] || nameObj['uz'] || Object.values(nameObj)[0]
                    } catch (e) { }

                    try {
                        const descObj = JSON.parse(s.description)
                        description = descObj[currentLocale] || descObj['uz'] || Object.values(descObj)[0]
                    } catch (e) { }

                    return {
                        ...s,
                        name,
                        description
                    }
                })
                setServices(parsedServices)
            })
            .catch(err => {
                console.error('Error loading services:', err)
            })
    }, [])

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.error(error)
            alert(`Kirishda xatolik: ${(error as any).message}`)
        }
    }

    useEffect(() => {
        if (selectedDate && selectedService) {
            setSelectedSlot(null)
            fetch(`/api/slots?date=${selectedDate.toISOString()}&serviceId=${selectedService.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSlots(data)
                    } else {
                        setSlots([])
                    }
                })
                .catch(err => {
                    console.error('Error fetching slots:', err)
                    setSlots([])
                })
        }
    }, [selectedDate, selectedService])

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setUploading(true)
        try {
            const newUploadedUrls: string[] = []
            const newUploadedFiles: File[] = []

            for (const file of files) {
                try {
                    const url = await uploadToFirebase(file, 'consultations')
                    newUploadedUrls.push(url)
                    newUploadedFiles.push(file)
                } catch (error) {
                    console.error(error)
                    alert(`${file.name} yuklanmadi`)
                }
            }
            setUploadedUrls(prev => [...prev, ...newUploadedUrls])
            setScreenshots(prev => [...prev, ...newUploadedFiles])
        } catch (error) {
            alert("Xatolik yuz berdi")
        } finally {
            setUploading(false)
            if (e.target) e.target.value = ''
        }
    }

    const removeFile = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index))
        setUploadedUrls(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!user) {
            alert('Iltimos, avval tizimga kiring')
            return
        }
        localStorage.setItem('userPhone', formData.phone)
        setStep(4)
    }

    const handlePaymentSubmit = async () => {
        if (screenshots.length === 0) {
            alert('Iltimos, to\'lov chekini yuklang')
            return
        }
        setLoading(true)
        try {
            const bookingPayload: any = {
                serviceId: selectedService?.id,
                notes: formData.notes,
                userEmail: user!.email,
                userName: user!.displayName,
                userImage: user!.photoURL
            }

            if (selectedSlot?.id.startsWith('dynamic_')) {
                bookingPayload.startTime = selectedSlot.startTime
            } else {
                bookingPayload.slotId = selectedSlot?.id
            }

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            })

            if (res.ok) {
                const booking = await res.json()
                setBookingId(booking.id)

                const updateRes = await fetch(`/api/bookings/${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentScreenshot: JSON.stringify(uploadedUrls)
                    })
                })

                if (updateRes.ok) {
                    setStep(5)
                } else {
                    const error = await updateRes.json()
                    alert(error.error || "Xatolik yuz berdi")
                }
            } else {
                const error = await res.json()
                alert(error.error || "Xatolik yuz berdi")
            }
        } catch (error) {
            alert("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { number: 1, title: 'Xizmat turi', icon: Calendar },
        { number: 2, title: 'Vaqtni tanlash', icon: Clock },
        { number: 3, title: "Ma'lumotlar", icon: User },
        { number: 4, title: "To'lov", icon: CreditCard },
    ];

    if (!user) {
        return (
            <div className="min-h-screen gradient-soft pt-24 pb-12 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass-strong p-8 rounded-3xl text-center shadow-xl"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                        <Lock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">Kabinetga Kirish</h2>
                    <p className="text-gray-600 mb-8">
                        Buyurtmalarni boshqarish va xavfsizlik uchun avval shaxsiy kabinetingizga kiring.
                    </p>

                    <Button
                        onClick={handleGoogleLogin}
                        variant="primary"
                        className="w-full flex items-center justify-center gap-3 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google orqali kirish
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen gradient-soft pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${((step - 1) / 3) * 100}%` }}
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
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive ? 'text-white' : 'text-gray-400'}`}
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

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="glass-strong p-8 md:p-12 rounded-3xl shadow-xl border border-white/50">
                            {step === 1 && (
                                <div>
                                    <h2 className="text-3xl font-bold mb-3 gradient-text">Xizmat turini tanlang</h2>
                                    <p className="text-gray-600 mb-8">Sizga mos keladigan konsultatsiya turini tanlang</p>

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
                                                                {service.duration} daqiqa
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-bold text-blue-600">{service.price.toLocaleString()}</div>
                                                        <div className="text-sm text-gray-500">UZS</div>
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

                                    <div className="mt-8 flex justify-end">
                                        <Button onClick={handleNext} disabled={!selectedService} variant="primary" className="btn-lg">
                                            Keyingi
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h2 className="text-3xl font-bold mb-3 gradient-text">Vaqtni tanlang</h2>
                                    <p className="text-gray-600 mb-8">Sizga qulay sana va vaqtni belgilang</p>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="glass-light p-6 rounded-2xl">
                                            <h3 className="font-semibold mb-4 text-gray-900">Sanani tanlang</h3>
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
                                            <h3 className="font-semibold mb-4 text-gray-900">Mavjud vaqtlar</h3>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                {slots.length === 0 ? (
                                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-gray-500 font-medium">Bu sanada bo'sh vaqtlar yo'q</p>
                                                        <p className="text-sm text-gray-400 mt-1">Iltimos, boshqa sana tanlang</p>
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
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${slot.isBooked ? 'bg-gray-200' : selectedSlot?.id === slot.id ? 'bg-green-500' : 'bg-blue-100'}`}>
                                                                    <Clock className={`w-5 h-5 ${slot.isBooked ? 'text-gray-400' : selectedSlot?.id === slot.id ? 'text-white' : 'text-blue-600'}`} />
                                                                </div>
                                                                <span className="font-semibold text-gray-900">{format(new Date(slot.startTime), 'HH:mm')}</span>
                                                            </div>
                                                            {slot.isBooked ? (
                                                                <span className="badge badge-error">Band</span>
                                                            ) : (
                                                                <span className="badge badge-success">Bo'sh</span>
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
                                            Orqaga
                                        </Button>
                                        <Button onClick={handleNext} disabled={!selectedSlot} variant="primary">
                                            Keyingi
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <h2 className="text-3xl font-bold mb-3 gradient-text">Ma'lumotlaringiz</h2>
                                    <p className="text-gray-600 mb-8">Siz bilan bog'lanishimiz uchun ma'lumotlarni kiriting</p>

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
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon raqam *</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="+998 90 123 45 67"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Qo'shimcha izoh</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                rows={4}
                                                placeholder="Kasallik haqida qisqacha ma'lumot..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <Button onClick={handleBack} variant="secondary" className="btn-ghost">
                                            <ArrowLeft className="w-5 h-5" />
                                            Orqaga
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={!formData.phone} loading={loading} variant="primary">
                                            Keyingi
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div>
                                    <h2 className="text-3xl font-bold mb-3 gradient-text">To'lov</h2>
                                    <p className="text-gray-600 mb-8">To'lovni amalga oshiring va chekni yuklang</p>

                                    <div className="glass-light p-8 rounded-2xl mb-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-gray-600">To'lov summasi:</span>
                                            <span className="text-4xl font-bold gradient-text">{selectedService?.price.toLocaleString()} UZS</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6">
                                            <p className="font-bold mb-3 text-gray-900">Karta raqami:</p>
                                            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-blue-200">
                                                <CreditCard className="w-8 h-8 text-blue-600" />
                                                <span className="text-2xl font-mono font-bold text-gray-900">8600 0000 0000 0000</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-3">Sultonbek Norkuziev nomiga</p>
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
                                                <p className="font-semibold text-gray-900 mb-2">Yuklanmoqda...</p>
                                            </>
                                        ) : screenshots.length > 0 ? (
                                            <>
                                                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                                                <p className="font-semibold text-gray-900 mb-2">{screenshots.length} ta chek yuklandi</p>
                                                <p className="text-xs text-blue-600 mt-2">Yana qo'shish uchun bosing</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-16 h-16 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                                <p className="font-semibold text-gray-900 mb-2">To'lov chekini yuklang</p>
                                                <p className="text-sm text-gray-500">JPG, PNG formatida (maks 5MB)</p>
                                            </>
                                        )}
                                    </div>

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
                                                        O'chirish
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <Button onClick={handleBack} variant="secondary" className="btn-ghost">
                                            <ArrowLeft className="w-5 h-5" />
                                            Orqaga
                                        </Button>
                                        <Button onClick={handlePaymentSubmit} loading={loading} variant="primary" disabled={screenshots.length === 0}>
                                            Yuborish
                                            <Check className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="text-center py-12">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.6 }}
                                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                                    >
                                        <Check className="w-12 h-12 text-white" />
                                    </motion.div>

                                    <h2 className="text-4xl font-bold mb-4 gradient-text">Muvaffaqiyatli!</h2>

                                    {/* Conditional message based on service type */}
                                    {selectedService?.name.toLowerCase().includes('online') ? (
                                        <div className="mb-8">
                                            <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
                                                Sizning so'rovingiz qabul qilindi. To'lov tasdiqlangandan so'ng Google Meet havolasi yuboriladi.
                                            </p>
                                            <div className="glass-light p-4 rounded-xl max-w-md mx-auto">
                                                <div className="flex items-center gap-3 text-blue-600">
                                                    <Video className="w-5 h-5" />
                                                    <span className="font-medium">Meeting havolasi shaxsiy kabinetingizda ko'rinadi</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-8">
                                            <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
                                                Sizning so'rovingiz qabul qilindi. Iltimos, qabulni belgilash uchun Telegram orqali bog'laning.
                                            </p>
                                            <div className="glass-light p-4 rounded-xl max-w-md mx-auto">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 mb-2">Telegram:</p>
                                                    <a
                                                        href="https://t.me/sultonbekdr"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-blue-600 font-bold text-lg hover:text-blue-700 transition-colors"
                                                    >
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                                                        </svg>
                                                        @sultonbekdr
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="glass-light p-6 rounded-2xl max-w-md mx-auto mb-8">
                                        <div className="space-y-3 text-left">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Xizmat:</span>
                                                <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Sana:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {selectedDate && format(selectedDate, 'dd.MM.yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vaqt:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {selectedSlot && format(new Date(selectedSlot.startTime), 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Holat:</span>
                                                <span className="badge badge-warning">Kutilmoqda</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <Button
                                            onClick={() => router.push(`/uz/dashboard`)}
                                            variant="primary"
                                            className="btn-lg"
                                        >
                                            Shaxsiy Kabinet
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            variant="secondary"
                                            className="btn-lg btn-ghost"
                                        >
                                            Yana buyurtma qilish
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
