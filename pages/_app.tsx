import type { AppProps } from 'next/app'
import { ThemeProvider } from "next-themes"
import Layout from '@/components/Layout'
import '../styles/globals.css'
import { initializeDb } from '../db'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from './login'
import { useRouter } from 'next/router'

function AppContent({ Component, pageProps }: AppProps) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (typeof window === 'undefined') {
            import('../db').then(({ initializeDb }) => {
                initializeDb().catch(console.error);
            });
        }

        if (!loading && !isAuthenticated && router.pathname !== '/login') {
            router.push('/login')
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {isAuthenticated ? (
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            ) : (
                <Component {...pageProps} />
            )}
        </ThemeProvider>
    )
}

function MyApp(props: AppProps) {
    return (
        <AuthProvider>
            <AppContent {...props} />
        </AuthProvider>
    )
}

export default MyApp