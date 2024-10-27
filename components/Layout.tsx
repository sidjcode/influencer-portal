import React from 'react'
import { Navigation } from './Navigation'
import { useRouter } from 'next/router'

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const isLoginPage = router.pathname === '/login'

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            {!isLoginPage && <Navigation />}
            <main className="flex-grow container mx-auto py-8">
                {children}
            </main>
            <footer className="border-t py-4">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    © 2024 Influencer Platform. All rights reserved.
                </div>
            </footer>
        </div>
    )
}