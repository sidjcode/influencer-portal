import type { AppProps } from 'next/app'
import { ThemeProvider } from "next-themes"
import Layout from '@/components/Layout'
import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
        if (typeof window === 'undefined') {
            import('../db').then(({ initializeDb }) => {
                initializeDb().catch(console.error);
            });
        }
    }, []);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </ThemeProvider>
    )
}

export default MyApp