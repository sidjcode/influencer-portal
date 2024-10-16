import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from "@/lib/utils"

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="border-b">
                <nav className="container mx-auto p-4">
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/" className={cn(
                                "transition-colors hover:text-primary",
                                router.pathname === '/' ? 'text-primary font-semibold' : ''
                            )}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/influencer-portal" className={cn(
                                "transition-colors hover:text-primary",
                                router.pathname === '/influencer-portal' ? 'text-primary font-semibold' : ''
                            )}>
                                Influencer Portal
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <main className="flex-grow container mx-auto py-8">
                {children}
            </main>
            <footer className="border-t py-4">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    © 2023 Influencer Portal. All rights reserved.
                </div>
            </footer>
        </div>
    )
}