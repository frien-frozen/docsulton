    'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Calendar, FileText, Award, Stethoscope } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
    bookings: { total: number; pending: number }
    projects: number
    posts: number
    services: number
    recentBookings: any[]
}

export default function AdminDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))       
    }, [])

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Xush kelibsiz, {session?.user?.name || 'Admin'}!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Link href="/admin/bookings" className="floating-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-600">Konsultatsiyalar</h3>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {stats?.bookings?.total || 0}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-orange-600 text-sm font-medium">
                        <span>{stats?.bookings?.pending || 0} ta kutilmoqda</span>
                    </div>
                </Link>

                <Link href="/admin/services" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-600">Xizmatlar</h3>
                        <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.services || 0}</p>
                </Link>

                <Link href="/admin/posts" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-600">Bloglar</h3>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.posts || 0}</p>
                </Link>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">So'nggi buyurtmalar</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="pb-4 font-medium">Mijoz</th>
                                <th className="pb-4 font-medium">Xizmat</th>
                                <th className="pb-4 font-medium">Holat</th>
                                <th className="pb-4 font-medium">Sana</th>
                                <th className="pb-4 font-medium text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats?.recentBookings?.map((booking: any) => (
                                <tr key={booking.id} className="text-sm">
                                    <td className="py-4 font-medium text-gray-900">{booking.user.username}</td>
                                    <td className="py-4 text-gray-600">{JSON.parse(booking.service.name).uz || 'Xizmat'}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                                            booking.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                                'bg-red-50 text-red-600'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-gray-500">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 text-right">
                                        <Link
                                            href="/admin/bookings"
                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition"
                                        >
                                            Boshqarish
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Hozircha buyurtmalar yo'q
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
