import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Suspense } from 'react'
import { Navigation } from '@/components/navigation'
import LoadingIndicator from '@/components/loading-indicator'
import NavigationProgress from '@/components/navigation-progress'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.className
        )}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <div className="min-h-screen flex flex-col bg-background text-foreground">
                    <NavigationProgress />
                    <Navigation />
                    <Suspense fallback={<LoadingIndicator />}>
                        <main className="flex-grow container mx-auto py-8">
                            {children}
                        </main>
                    </Suspense>
                    <footer className="border-t py-4">
                        <div className="container mx-auto text-center text-sm text-muted-foreground">
                            © 2024 Influencer Platform. All rights reserved.
                        </div>
                    </footer>
                </div>
                <Toaster />
            </ThemeProvider>
        </div>
    )
}