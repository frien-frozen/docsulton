'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import ConfirmModal from '@/components/ConfirmModal'

interface ConfirmModalState {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'warning' | 'success' | 'info'
}

interface ModalContextType {
    showConfirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        type?: 'danger' | 'warning' | 'success' | 'info'
    ) => void
    showSuccess: (title: string, message: string) => void
    showError: (title: string, message: string) => void
    showInfo: (title: string, message: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    })

    const showConfirm = (
        title: string,
        message: string,
        onConfirm: () => void,
        type: 'danger' | 'warning' | 'success' | 'info' = 'warning'
    ) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        })
    }

    const showSuccess = (title: string, message: string) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm: () => { },
            type: 'success'
        })
    }

    const showError = (title: string, message: string) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm: () => { },
            type: 'danger'
        })
    }

    const showInfo = (title: string, message: string) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm: () => { },
            type: 'info'
        })
    }

    return (
        <ModalContext.Provider value={{ showConfirm, showSuccess, showError, showInfo }}>
            {children}
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
            />
        </ModalContext.Provider>
    )
}

export function useModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}
