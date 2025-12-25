'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'success' | 'info'
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Tasdiqlash',
    cancelText = 'Bekor qilish',
    type = 'warning'
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <XCircle className="w-12 h-12 text-red-500" />,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    iconBg: 'bg-red-100'
                }
            case 'success':
                return {
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                    iconBg: 'bg-green-100'
                }
            case 'info':
                return {
                    icon: <AlertCircle className="w-12 h-12 text-blue-500" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                    iconBg: 'bg-blue-100'
                }
            default: // warning
                return {
                    icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
                    iconBg: 'bg-yellow-100'
                }
        }
    }

    const styles = getTypeStyles()

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
                                {styles.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                {title}
                            </h3>

                            {/* Message */}
                            <p className="text-gray-600 text-center mb-6">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-3 ${styles.buttonColor} text-white rounded-xl font-semibold transition shadow-lg`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
