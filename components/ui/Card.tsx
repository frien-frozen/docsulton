import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6',
                'border border-gray-200 dark:border-gray-700',
                hover && 'card-hover cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    )
}
