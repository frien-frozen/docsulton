'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope,
    TrendingUp,
    Bell,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ModalProvider } from '@/contexts/ModalContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    // Check if current page is login page
    const isLoginPage = pathname?.includes('/admin/login')

    useEffect(() => {
        if (status === 'unauthenticated' && !isLoginPage) {
            router.push('/admin/login')
        }
    }, [status, router, isLoginPage])

    // If on login page, render without layout
    if (isLoginPage) {
        return <>{children}</>
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Konsultatsiyalar', icon: Calendar, href: '/admin/bookings' },
        { name: 'Statistika', icon: TrendingUp, href: '/admin/statistics' },
        { name: 'Xizmatlar', icon: Stethoscope, href: '/admin/services' },
        { name: 'Vaqt sozlamalari', icon: Clock, href: '/admin/availability' },
        { name: 'Blog Postlar', icon: FileText, href: '/admin/posts' },
        { name: 'Xabarlar', icon: Bell, href: '/admin/notifications' },
    ]

    return (
        <ModalProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <Link href="/admin" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                            </Link>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-blue-50 text-blue-600 font-medium header-shadow'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                    {session.user?.name?.[0] || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{session.user?.name || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Chiqish
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 overflow-hidden">
                    {/* Mobile Header */}
                    <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-gray-900">Admin Panel</span>
                    </header>

                    <div className="h-[calc(100vh-65px)] lg:h-screen overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ModalProvider>
    )
}
