'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Award, Users, Heart, Clock, Shield, Star, Globe } from 'lucide-react'
import Footer from '@/components/Footer'

export default function HomePage() {
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    experience: 10,
    patients: 5000,
    successRate: 98,
    operations: 1200
  })

  useEffect(() => {
    setMounted(true)
    // Fetch statistics from API
    fetch('/api/statistics')
      .then(res => res.json())
      .then(data => {
        setStats({
          experience: data.experience || 10,
          patients: data.patients || 5000,
          successRate: data.successRate || 98,
          operations: data.operations || 1200
        })
      })
      .catch(err => console.error('Failed to fetch stats:', err))
  }, [])

  return (
    <div className="min-h-screen gradient-soft">
      {/* Navigation */}


      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 pb-20 px-4 relative overflow-hidden bg-gradient-to-br from-blue-100 via-white to-green-100 animate-gradient">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="layer-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Professional Urologist</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="gradient-text">{t('Hero.title')}</span>
              </h1>

              <p className="text-xl text-gray-600 mb-4 font-medium">
                {t('Hero.subtitle')}
              </p>

              <p className="text-base text-gray-500 mb-8 leading-relaxed">
                {t('Hero.description')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/consultation" className="btn btn-primary group">
                  <Calendar className="w-5 h-5" />
                  {t('Hero.bookConsultation')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard" className="btn btn-secondary group">
                  <Users className="w-5 h-5" />
                  Mening konsultatsiyalarim
                </Link>
                <Link href="/about" className="btn btn-outline">
                  {t('Hero.learnMore')}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.experience}+</div>
                  <div className="text-sm text-gray-600">{t('Hero.Stats.years')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.patients.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">{t('Hero.Stats.patients')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{stats.successRate}%</div>
                  <div className="text-sm text-gray-600">{t('Hero.Stats.success')}</div>
                </div>
              </div>
            </motion.div>

            {/* Right - Doctor Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative layer-1"
            >
              <div className="relative mx-auto md:mr-0 max-w-sm md:max-w-md">
                {/* Decorative Frame */}
                <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-br from-blue-400/30 to-green-400/30 rounded-[2.5rem] -z-10 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-full h-full bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-[2.5rem] -z-10 blur-xl"></div>

                {/* Image Container */}
                <div className="aspect-[4/5] md:aspect-square bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-white/50 rounded-[2rem] flex items-end justify-center shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
                  <img
                    src="/images/dr-hero.png"
                    alt="Dr. Sultonbek Norkuziev"
                    className="w-[115%] h-[115%] object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 glass-strong p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{t('Hero.Doctor.badgeTitle')}</div>
                      <div className="text-xs text-gray-600">{t('Hero.Doctor.badgeSubtitle')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 gradient-text">{t('Hero.Services.title')}</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              {t('Hero.Services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="floating-card p-8 card-asymmetric group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t('Hero.Services.consultation.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                {t('Hero.Services.consultation.desc')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">{t('Hero.Services.consultation.price')}</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="floating-card p-8 card-asymmetric group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t('Hero.Services.checkup.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                {t('Hero.Services.checkup.desc')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-green-600">{t('Hero.Services.checkup.price')}</span>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>

            {/* Service Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="floating-card p-8 card-asymmetric group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t('Hero.Services.family.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                {t('Hero.Services.family.desc')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-orange-600">{t('Hero.Services.family.button')}</span>
                <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 px-4 gradient-primary">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('Hero.Trust.certified')}</h4>
              <p className="text-sm text-gray-600">{t('Hero.Trust.certifiedDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('Hero.Trust.trusted')}</h4>
              <p className="text-sm text-gray-600">{t('Hero.Trust.trustedDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('Hero.Trust.support')}</h4>
              <p className="text-sm text-gray-600">{t('Hero.Trust.supportDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Globe className="w-10 h-10 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{t('Hero.Trust.languages')}</h4>
              <p className="text-sm text-gray-600">{t('Hero.Trust.languagesDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong p-12 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 gradient-text">{t('Hero.CTA.title')}</h2>
              <p className="text-base text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('Hero.CTA.desc')}
              </p>
              <Link href="/consultation" className="btn btn-primary btn-lg inline-flex">
                <Calendar className="w-6 h-6" />
                {t('Hero.CTA.button')}
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
