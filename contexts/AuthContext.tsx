import React, { createContext, useState, useContext, useEffect } from 'react'

interface AuthContextType {
    isAuthenticated: boolean
    loading: boolean
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('authToken')
        setIsAuthenticated(!!token)
        setLoading(false)
    }, [])

    const login = async (username: string, password: string) => {
        if (username === 'sid' && password === 'AkiFlow123') {
            localStorage.setItem('authToken', 'dummyToken')
            setIsAuthenticated(true)
            return true
        }
        return false
    }

    
    const logout = () => {
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}