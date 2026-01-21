'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import Footer from '@/components/Footer'

export default function ServicesPage() {
    const t = useTranslations('Services')

    const services = [
        {
            icon: Calendar,
            title: t('Items.consultation.title'),
            price: t('Items.consultation.price'),
            description: t('Items.consultation.description'),
            features: [
                t('Items.consultation.features.0'),
                t('Items.consultation.features.1'),
                t('Items.consultation.features.2'),
                t('Items.consultation.features.3')
            ],
            color: 'blue'
        },
        {
            icon: Clock,
            title: t('Items.checkup.title'),
            price: t('Items.checkup.price'),
            description: t('Items.checkup.description'),
            features: [
                t('Items.checkup.features.0'),
                t('Items.checkup.features.1'),
                t('Items.checkup.features.2'),
                t('Items.checkup.features.3')
            ],
            color: 'green'
        },
        {
            icon: Users,
            title: t('Items.family.title'),
            price: t('Items.family.price'),
            description: t('Items.family.description'),
            features: [
                t('Items.family.features.0'),
                t('Items.family.features.1'),
                t('Items.family.features.2'),
                t('Items.family.features.3')
            ],
            color: 'orange'
        }
    ]

    return (
        <div className="min-h-screen gradient-soft pt-20">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6 gradient-text"
                    >
                        {t('title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        {t('subtitle')}
                    </motion.p>
                </div>
            </section>

            {/* Services List */}
            <section className="pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="floating-card p-8 group flex flex-col h-full bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl hover:shadow-xl transition-all duration-300"
                            >
                                <div className={`w-16 h-16 bg-${service.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <service.icon className={`w-8 h-8 text-${service.color}-600`} />
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-gray-900">{service.title}</h3>
                                <div className={`text-2xl font-bold text-${service.color}-600 mb-4`}>{service.price}</div>

                                <p className="text-gray-600 mb-8 border-b border-gray-100 pb-8">
                                    {service.description}
                                </p>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-600">
                                            <CheckCircle2 className={`w-5 h-5 text-${service.color}-500 flex-shrink-0`} />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/consultation"
                                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all 
                                        ${service.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' :
                                            service.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30' :
                                                'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30'}`}
                                >
                                    <Calendar className="w-5 h-5" />
                                    {t('bookNow')}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
