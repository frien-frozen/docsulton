'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface MultiLangInputProps {
    label: string
    value: string // JSON string
    onChange: (newValue: string) => void
    type?: 'text' | 'textarea'
    required?: boolean
    placeholder?: string
}

export default function MultiLangInput({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    placeholder
}: MultiLangInputProps) {
    const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz')

    // Parse initial value or default to empty structure
    let values
    try {
        values = value ? JSON.parse(value) : { uz: '', ru: '', en: '' }
    } catch (e) {
        values = { uz: '', ru: '', en: '' }
    }

    const handleChange = (text: string) => {
        const newValues = { ...values, [activeLang]: text }
        onChange(JSON.stringify(newValues))
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">{label} {required && '*'}</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {(['uz', 'ru', 'en'] as const).map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => setActiveLang(lang)}
                            className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${activeLang === lang
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            {type === 'textarea' ? (
                <textarea
                    value={values[activeLang] || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all min-h-[100px]"
                    placeholder={placeholder ? `${placeholder} (${activeLang.toUpperCase()})` : `Matnni kiriting (${activeLang.toUpperCase()})`}
                    required={required && activeLang === 'uz'} // Only UZ required strictly? Or checks elsewhere.
                />
            ) : (
                <input
                    type="text"
                    value={values[activeLang] || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                    placeholder={placeholder ? `${placeholder} (${activeLang.toUpperCase()})` : `Matnni kiriting (${activeLang.toUpperCase()})`}
                    required={required && activeLang === 'uz'}
                />
            )}
        </div>
    )
}
