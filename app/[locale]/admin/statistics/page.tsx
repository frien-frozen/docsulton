'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Award, Target, Calendar, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { useModal } from '@/contexts/ModalContext'

interface Statistics {
    id: string
    operations: number
    experienceStartYear: number
    experience: number // Calculated
    patients: number
    consultations: number
    successRate: number
}

export default function AdminStatisticsPage() {
    const modal = useModal()
    const [stats, setStats] = useState<Statistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    const [formData, setFormData] = useState({
        operations: 0,
        experienceStartYear: new Date().getFullYear(),
        patients: 0,
        consultations: 0,
        successRate: 0
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/statistics')
            const data = await res.json()
            setStats(data)
            setFormData({
                operations: data.operations,
                experienceStartYear: data.experienceStartYear,
                patients: data.patients,
                consultations: data.consultations || 0,
                successRate: data.successRate
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const res = await fetch('/api/statistics', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const data = await res.json()
                setStats(data)
                setIsEditing(false)
                modal.showSuccess('Muvaffaqiyatli', 'Statistika yangilandi')
            } else {
                modal.showError('Xatolik', 'Statistikani yangilashda xatolik')
            }
        } catch (error) {
            console.error(error)
            modal.showError('Xatolik', 'Xatolik yuz berdi')
        }
    }

    const currentYear = new Date().getFullYear()
    const calculatedExperience = stats ? currentYear - stats.experienceStartYear : 0

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Statistika
                        </h1>
                        <p className="text-gray-500 mt-1">Shifokor statistikasini boshqarish</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 ${isEditing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                    >
                        {isEditing ? 'Bekor qilish' : 'Tahrirlash'}
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Operations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-6 rounded-2xl border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Target className="w-6 h-6" />
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, operations: formData.operations + 1 })}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                >
                                    +1
                                </button>
                            )}
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Operatsiyalar</h3>
                        {isEditing ? (
                            <input
                                type="number"
                                value={formData.operations}
                                onChange={(e) => setFormData({ ...formData, operations: parseInt(e.target.value) || 0 })}
                                className="text-3xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-200 rounded-lg"
                            />
                        ) : (
                            <p className="text-3xl font-bold text-gray-900">{stats?.operations.toLocaleString()}</p>
                        )}
                    </motion.div>

                    {/* Experience */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass p-6 rounded-2xl border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Tajriba</h3>
                        {isEditing ? (
                            <div>
                                <label className="text-xs text-gray-500">Boshlang'ich yil:</label>
                                <input
                                    type="number"
                                    value={formData.experienceStartYear}
                                    onChange={(e) => setFormData({ ...formData, experienceStartYear: parseInt(e.target.value) || currentYear })}
                                    className="text-2xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-200 rounded-lg"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    = {currentYear - formData.experienceStartYear} yil
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{calculatedExperience}+</p>
                                <p className="text-xs text-gray-400 mt-1">yil ({stats?.experienceStartYear} yildan)</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Patients */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-6 rounded-2xl border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, patients: formData.patients + 1 })}
                                    className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                                >
                                    +1
                                </button>
                            )}
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Bemorlar</h3>
                        {isEditing ? (
                            <input
                                type="number"
                                value={formData.patients}
                                onChange={(e) => setFormData({ ...formData, patients: parseInt(e.target.value) || 0 })}
                                className="text-3xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-200 rounded-lg"
                            />
                        ) : (
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats?.patients.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1">Avtomatik oshadi</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Success Rate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass p-6 rounded-2xl border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Muvaffaqiyat</h3>
                        {isEditing ? (
                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.successRate}
                                    onChange={(e) => setFormData({ ...formData, successRate: parseFloat(e.target.value) || 0 })}
                                    className="text-3xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-200 rounded-lg"
                                />
                                <p className="text-xs text-gray-500 mt-1">%</p>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-gray-900">{stats?.successRate}%</p>
                        )}
                    </motion.div>

                    {/* Consultations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass p-6 rounded-2xl border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, consultations: formData.consultations + 1 })}
                                    className="text-xs px-2 py-1 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200"
                                >
                                    +1
                                </button>
                            )}
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Konsultatsiyalar</h3>
                        {isEditing ? (
                            <input
                                type="number"
                                value={formData.consultations}
                                onChange={(e) => setFormData({ ...formData, consultations: parseInt(e.target.value) || 0 })}
                                className="text-3xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-200 rounded-lg"
                            />
                        ) : (
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats?.consultations?.toLocaleString() || 0}</p>
                                <p className="text-xs text-gray-400 mt-1">Avtomatik oshadi</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Save Button */}
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                    >
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Saqlash
                        </button>
                    </motion.div>
                )}

                {/* Info Box */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Avtomatik yangilanish
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• <strong>Tajriba:</strong> Har yili avtomatik 1 yil qo'shiladi (boshlang'ich yildan hisoblangan)</li>
                        <li>• <strong>Bemorlar va Konsultatsiyalar:</strong> Har bir tasdiqlangan konsultatsiyadan keyin avtomatik 1 ga oshadi</li>
                        <li>• <strong>Operatsiyalar:</strong> Operatsiya yakunlanganda avtomatik oshadi</li>
                        <li>• <strong>Muvaffaqiyat:</strong> Operatsiya natijalari asosida avtomatik hisoblanadi</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
