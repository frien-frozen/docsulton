'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { useState, useEffect } from 'react'
import { Heart, Menu, X, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'

export default function Navbar() {
    const t = useTranslations('Navigation')
    const pathname = usePathname()
    const locale = useLocale()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const links = [
        { href: '/', label: t('home') },
        { href: '/about', label: t('about') },
        { href: '/services', label: t('services') },
        { href: '/blog', label: t('blog') },
        { href: '/contact', label: t('contact') },
    ]

    const isActive = (path: string) => pathname === path

    // Check for special pages that need "Back" button only
    // Note: pathname might include locale prefix depending on configuration, 
    // but typically usePathname from navigation handles it. 
    // We check if it ENDS with /consultation or contains /blog/ (but is not just /blog)
    const isBookingPage = pathname === '/consultation' || pathname.endsWith('/consultation')
    const isBlogPostPage = pathname.includes('/blog/') && pathname.split('/').filter(Boolean).length > 2 // simplistic check for /blog/[slug] (e.g. /uz/blog/slug)

    // Simplified logic: strict check
    const isMinimalNav = pathname.includes('/consultation') || (pathname.includes('/blog/') && pathname.split('/').length > (locale ? 3 : 2))

    // Better check using regex or string manipulation
    const showBackButton = pathname.includes('/consultation') || (pathname.includes('/blog/') && pathname !== '/blog' && !pathname.endsWith('/blog'))

    if (showBackButton) {
        return (
            <nav className="fixed top-0 w-full z-50 p-4">
                <Link
                    href={pathname.includes('/blog/') ? '/blog' : '/'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl text-gray-700 hover:text-blue-600 transition-all hover:scale-105"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Orqaga</span>
                </Link>
            </nav>
        )
    }

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-strong border-b border-gray-200/50 shadow-sm' : 'bg-transparent'
            }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center gap-3 relative z-50">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <span className="text-xl md:text-2xl font-bold gradient-text">Dr. Sultonbek</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-medium transition ${isActive(link.href)
                                    ? 'text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden relative z-50 p-2 text-gray-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 pt-24 px-6 md:hidden flex flex-col items-center gap-8"
                    >
                        <div className="flex flex-col items-center gap-6 w-full">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-xl font-medium ${isActive(link.href) ? 'text-blue-600' : 'text-gray-900'}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
