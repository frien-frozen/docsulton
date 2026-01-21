'use client'

import { useState, useEffect } from 'react'
import { Settings, Clock, Calendar, Plus, Trash2, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

interface BlockedRule {
    id: string
    type: 'RECURRING' | 'SPECIFIC_DATE'
    dayOfWeek?: number
    date?: string
    startTime: string
    endTime: string
    note?: string
}

export default function AvailabilitySettings() {
    const [settings, setSettings] = useState({
        workingHoursStart: 6,
        workingHoursEnd: 22,
        blockedDays: "0,6"
    })
    const [blockedRules, setBlockedRules] = useState<BlockedRule[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // New Rule Form State
    const [newRule, setNewRule] = useState({
        type: 'RECURRING', // RECURRING | SPECIFIC_DATE
        dayOfWeek: 1,
        date: '',
        startTime: '12:00',
        endTime: '13:00',
        note: ''
    })

    const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

    useEffect(() => {
        fetchSettings()
        fetchRules()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/availability')
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/admin/availability/blocked')
            if (res.ok) {
                const data = await res.json()
                setBlockedRules(data)
            }
        } catch (error) {
            console.error('Error fetching rules:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSettings = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                alert('Asosiy sozlamalar saqlandi!')
            } else {
                alert('Xatolik yuz berdi')
            }
        } catch (error) {
            alert('Xatolik yuz berdi')
        } finally {
            setSaving(false)
        }
    }

    const handleAddRule = async () => {
        try {
            const payload = {
                type: newRule.type,
                startTime: newRule.startTime,
                endTime: newRule.endTime,
                note: newRule.note,
                dayOfWeek: newRule.type === 'RECURRING' ? newRule.dayOfWeek : undefined,
                date: newRule.type === 'SPECIFIC_DATE' ? newRule.date : undefined
            }

            const res = await fetch('/api/admin/availability/blocked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                fetchRules()
                setIsModalOpen(false)
                setNewRule({
                    type: 'RECURRING',
                    dayOfWeek: 1,
                    date: '',
                    startTime: '12:00',
                    endTime: '13:00',
                    note: ''
                })
            } else {
                alert('Xatolik')
            }
        } catch (error) {
            alert('Xatolik')
        }
    }

    const handleDeleteRule = async (id: string) => {
        if (!confirm("O'chirishni tasdiqlaysizmi?")) return
        try {
            await fetch(`/api/admin/availability/blocked?id=${id}`, { method: 'DELETE' })
            fetchRules()
        } catch (error) {
            alert('Xatolik')
        }
    }

    const toggleDay = (day: number) => {
        const blockedDaysArray = settings.blockedDays.split(',').filter(d => d).map(d => parseInt(d))
        const index = blockedDaysArray.indexOf(day)

        if (index > -1) {
            blockedDaysArray.splice(index, 1)
        } else {
            blockedDaysArray.push(day)
        }

        setSettings({
            ...settings,
            blockedDays: blockedDaysArray.join(',')
        })
    }

    const isDayBlocked = (day: number) => {
        return settings.blockedDays.split(',').map(d => parseInt(d)).includes(day)
    }

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Mavjudlik Sozlamalari
                </h1>
                <p className="text-gray-500 mt-1">Ish vaqti va dam olish kunlarini boshqaring</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* GLOBAL SETTINGS */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Ish vaqti (Barcha kunlar)</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Boshlanish</label>
                                <input
                                    type="number" min="0" max="23"
                                    value={settings.workingHoursStart}
                                    onChange={(e) => setSettings({ ...settings, workingHoursStart: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tugash</label>
                                <input
                                    type="number" min="0" max="23"
                                    value={settings.workingHoursEnd}
                                    onChange={(e) => setSettings({ ...settings, workingHoursEnd: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Umumiy Dam Olish Kunlari</h2>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {dayNames.map((name, index) => (
                                <button
                                    key={index}
                                    onClick={() => toggleDay(index)}
                                    className={`p-2 rounded-xl text-xs font-medium transition-all ${isDayBlocked(index)
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-green-50 text-green-600 border border-green-200'
                                        }`}
                                >
                                    {name.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Bu kunlarda navbat butunlay yopiladi.</p>
                    </div>

                    <Button onClick={handleSaveSettings} loading={saving} variant="primary" className="w-full">
                        <Settings className="w-4 h-4 mr-2" /> Asosiy Sozlamalarni Saqlash
                    </Button>
                </div>

                {/* SPECIFIC RULES */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Qo'shimcha Cheklovlar</h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]">
                            {blockedRules.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                    Qo'shimcha qoidalar yo'q
                                </div>
                            ) : (
                                blockedRules.map(rule => (
                                    <div key={rule.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-start justify-between pr-8">
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {rule.type === 'RECURRING'
                                                        ? `Har ${dayNames[rule.dayOfWeek!]}`
                                                        : rule.date ? format(new Date(rule.date), 'dd.MM.yyyy') : '??'}
                                                </p>
                                                <p className="text-sm font-mono text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                                                    {rule.startTime} - {rule.endTime}
                                                </p>
                                                {rule.note && <p className="text-xs text-gray-500 mt-1 italic">"{rule.note}"</p>}
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                {rule.type === 'RECURRING' ? 'Takroriy' : 'Sana'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD RULE MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Yangi Cheklov Qo'shish</h3>
                                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Turini tanlang</label>
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setNewRule({ ...newRule, type: 'RECURRING' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${newRule.type === 'RECURRING' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                        >
                                            Har hafta
                                        </button>
                                        <button
                                            onClick={() => setNewRule({ ...newRule, type: 'SPECIFIC_DATE' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${newRule.type === 'SPECIFIC_DATE' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                        >
                                            Aniq sana
                                        </button>
                                    </div>
                                </div>

                                {newRule.type === 'RECURRING' ? (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kun</label>
                                        <select
                                            value={newRule.dayOfWeek}
                                            onChange={e => setNewRule({ ...newRule, dayOfWeek: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white"
                                        >
                                            {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Sana</label>
                                        <input
                                            type="date"
                                            value={newRule.date}
                                            onChange={e => setNewRule({ ...newRule, date: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Boshlanish</label>
                                        <input
                                            type="time"
                                            value={newRule.startTime}
                                            onChange={e => setNewRule({ ...newRule, startTime: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tugash</label>
                                        <input
                                            type="time"
                                            value={newRule.endTime}
                                            onChange={e => setNewRule({ ...newRule, endTime: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Izoh (ixtiyoriy)</label>
                                    <input
                                        type="text"
                                        value={newRule.note}
                                        onChange={e => setNewRule({ ...newRule, note: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200"
                                        placeholder="Tushlik, bayram..."
                                    />
                                </div>

                                <Button onClick={handleAddRule} variant="primary" className="w-full mt-4">
                                    Qo'shish
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
