'use client'

import { Heart } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 border-t border-gray-200 py-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">Dr. Sultonbek</span>
                </div>
                <p className="text-gray-600 mb-6">Professional urolog xizmatlari</p>
                <div className="flex justify-center gap-6 mb-6">
                    <a href="https://t.me/sultonbekdr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition">Telegram</a>
                    <a href="https://www.youtube.com/@doc.sultonbek" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition">YouTube</a>
                    <a href="https://www.instagram.com/doc.sultonbek/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition">Instagram</a>
                </div>
                <p className="text-sm text-gray-500">© 2024 Dr. Sultonbek Norkuziev. Barcha huquqlar himoyalangan.</p>
            </div>
        </footer>
    )
}
