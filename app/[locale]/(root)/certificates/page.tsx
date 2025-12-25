'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

interface Certificate {
    id: string
    title: string
    description?: string
    imageUrl: string
    issuedBy?: string
    issuedDate?: string
}

export default function CertificatesPage() {
    const t = useTranslations('Certificates')
    const locale = useLocale()
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/certificates')
            .then(res => res.json())
            .then(data => {
                setCertificates(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const getLocalizedContent = (jsonString: string) => {
        try {
            const content = JSON.parse(jsonString)
            return content[locale] || content['uz'] || ''
        } catch (e) {
            return jsonString
        }
    }

    return (
        <div className="min-h-screen gradient-soft pt-24 pb-20">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
                    >
                        {t('title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        {t('subtitle')}
                    </motion.p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 bg-white/50 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600">{t('empty')}</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {certificates.map((cert, index) => {
                            const title = getLocalizedContent(cert.title)
                            const description = cert.description ? getLocalizedContent(cert.description) : ''

                            return (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="break-inside-avoid"
                                >
                                    <div
                                        className="floating-card bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-lg cursor-pointer group"
                                        onClick={() => setSelectedImage(cert.imageUrl)}
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            <img
                                                src={cert.imageUrl}
                                                alt={title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 text-white font-semibold px-4 py-2 glass-dark rounded-full">
                                                    {t('view')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                {title}
                                            </h3>
                                            {description && (
                                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{description}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
                                                {cert.issuedBy && (
                                                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        {cert.issuedBy}
                                                    </span>
                                                )}
                                                {cert.issuedDate && (
                                                    <span>{formatDate(cert.issuedDate)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-5xl w-full relative">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <span className="text-4xl">×</span>
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={selectedImage}
                            alt="Certificate"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    )
}
