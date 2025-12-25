'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setSuccess(true)
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
            } else {
                setError('Xatolik yuz berdi')
            }
        } catch (err) {
            setError('Xatolik yuz berdi')
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        { icon: Phone, title: 'Telefon', value: '+998 90 123 45 67', color: 'blue' },
        { icon: Mail, title: 'Email', value: 'sultonbek.dr@gmail.com', color: 'green' },
        { icon: MapPin, title: 'Manzil', value: 'Toshkent sh, Yunusobod', color: 'orange' },
        { icon: Clock, title: 'Ish vaqti', value: 'Du-Sha: 09:00 - 18:00', color: 'purple' },
    ]

    return (
        <div className="min-h-screen gradient-soft pt-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6 gradient-text"
                    >
                        Bog'lanish
                    </motion.h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Savollaringiz bormi? Biz bilan bog'laning yoki xabar qoldiring.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {contactInfo.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass p-6 rounded-2xl flex items-center gap-4"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${item.color}-100 text-${item.color}-600`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{item.title}</p>
                                    <p className="text-lg font-bold text-gray-900">{item.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-strong p-8 rounded-3xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Xabar yuborish</h2>

                            {success && (
                                <div className="bg-green-100 border border-green-500 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Xabaringiz muvaffaqiyatli yuborildi!
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-100 border border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="Ismingiz"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="bg-white/50"
                                    />
                                    <Input
                                        label="Telefon"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-white/50"
                                    />
                                </div>

                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="bg-white/50"
                                />

                                <Input
                                    label="Mavzu"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="bg-white/50"
                                />

                                <Textarea
                                    label="Xabar"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={6}
                                    required
                                    className="bg-white/50"
                                />

                                <Button type="submit" variant="primary" className="w-full btn-lg" loading={loading}>
                                    Yuborish
                                    <Send className="w-5 h-5 ml-2" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
