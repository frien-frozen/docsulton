'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Calendar, Award, Users, Activity, Linkedin, Instagram, Youtube, Send } from 'lucide-react'
import Footer from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import { useState, useEffect } from 'react'

export default function AboutPage() {
    const t = useTranslations('About')
    const [statsData, setStatsData] = useState({
        experience: 8,
        patients: 5000,
        operations: 1200,
        consultations: 15000
    })

    useEffect(() => {
        // Fetch statistics from API
        fetch('/api/statistics')
            .then(res => res.json())
            .then(data => {
                setStatsData({
                    experience: data.experience || 8,
                    patients: data.patients || 5000,
                    operations: data.operations || 1200,
                    consultations: data.patients || 15000 // Using patients as consultations for now
                })
            })
            .catch(err => console.error('Failed to fetch stats:', err))
    }, [])

    const stats = [
        { icon: Users, label: t('stats.patients'), value: `${statsData.patients.toLocaleString()}+`, color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: Award, label: t('stats.experience'), value: `${statsData.experience} ` + (t('stats.experience') === 'Experience' ? 'years' : 'yil'), color: 'text-purple-600', bg: 'bg-purple-50' },
        { icon: Activity, label: t('stats.operations'), value: `${statsData.operations.toLocaleString()}+`, color: 'text-green-600', bg: 'bg-green-50' },
        { icon: Calendar, label: t('stats.consultations'), value: `${(statsData.consultations / 1000).toFixed(0)}k+`, color: 'text-orange-600', bg: 'bg-orange-50' },
    ]

    return (
        <div className="min-h-screen gradient-soft pt-24 pb-20">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="min-h-[calc(100vh-140px)] flex items-center py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative z-10"
                        >
                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-200 rounded-full blur-2xl"></div>
                            <span className="inline-block px-4 py-2 bg-white/80 backdrop-blur rounded-full text-blue-600 font-bold text-sm mb-6 border border-blue-100 shadow-sm">
                                {t('role')}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                {t.rich('title', {
                                    span: (chunks) => <span className="gradient-text">{chunks}</span>
                                })}
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {t('bio')}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link href="/contact" className="btn btn-primary">
                                    <Calendar className="w-5 h-5" />
                                    {t('bookAppointment')}
                                </Link>
                                <a href="#more" className="btn btn-outline bg-white hover:bg-gray-50">
                                    {t('readMore')}
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[3rem] transform rotate-3 opacity-20 blur-2xl"></div>
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/50 backdrop-blur-sm">
                                <img
                                    src="/images/dr-about.jpg"
                                    alt="Dr. Sultonbek"
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                            <Award className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Oliy Toifa</p>
                                            <p className="text-gray-300 text-sm">Urolog-Androlog</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20" id="more">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass p-6 rounded-2xl text-center hover:transform hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className={`w-12 h-12 mx-auto ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass p-8 rounded-3xl"
                    >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">🎓</span>
                            {t('sections.education')}
                        </h3>
                        <ul className="space-y-4">
                            {[0, 1, 2, 3].map((i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5"></div>
                                    <span>{t(`educationList.${i}`)}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass p-8 rounded-3xl"
                    >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">💼</span>
                            {t('sections.directions')}
                        </h3>
                        <ul className="space-y-4">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5"></div>
                                    <span>{t(`directionsList.${i}`)}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Social Links */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-8 gradient-text">{t('social')}</h2>
                    <div className="flex justify-center gap-6">
                        <motion.a
                            href="https://t.me/sultonbekdr"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5 }}
                            className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-blue-500/30 transition-all"
                        >
                            <Send className="w-7 h-7" />
                        </motion.a>

                        <motion.a
                            href="https://www.instagram.com/doc.sultonbek/"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5 }}
                            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/30 transition-all"
                        >
                            <Instagram className="w-7 h-7" />
                        </motion.a>

                        <motion.a
                            href="https://www.youtube.com/@doc.sultonbek"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5 }}
                            className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-red-500/30 transition-all"
                        >
                            <Youtube className="w-7 h-7" />
                        </motion.a>

                        <motion.a
                            href="#"
                            whileHover={{ y: -5 }}
                            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-blue-600/30 transition-all"
                        >
                            <Linkedin className="w-7 h-7" />
                        </motion.a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
