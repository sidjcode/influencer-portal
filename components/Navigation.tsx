import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export function Navigation() {
    const router = useRouter()

    const handleLogout = () => {
        // Implement logout logic here
        localStorage.removeItem('authToken')
        router.push('/login')
    }

    return (
        <nav className="bg-secondary text-secondary-foreground p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="mr-2"
                    />
                    <span className="font-bold text-lg">Influencer Platform</span>
                </Link>
                <ul className="flex items-center space-x-4">
                    <li>
                        <Link href="/dashboard" className={router.pathname === "/dashboard" ? "font-bold" : ""}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/influencers" className={router.pathname === "/influencers" ? "font-bold" : ""}>
                            Influencers
                        </Link>
                    </li>
                    <li>
                        <Link href="/deals" className={router.pathname === "/deals" ? "font-bold" : ""}>
                            Deals
                        </Link>
                    </li>
                    <li>
                        <Link href="/videos" className={router.pathname === "/videos" ? "font-bold" : ""}>
                            Videos
                        </Link>
                    </li>
                    <li>
                        <Link href="/agencies" className={router.pathname === "/agencies" ? "font-bold" : ""}>
                            Agencies
                        </Link>
                    </li>
                    <li>
                        <Link href="/reports" className={router.pathname === "/reports" ? "font-bold" : ""}>
                            Reports
                        </Link>
                    </li>
                    <li>
                        <Link href="/calendar" className={router.pathname === "/calendar" ? "font-bold" : ""}>
                            Calendar
                        </Link>
                    </li>
                    <li>
                        <Button variant="ghost" onClick={handleLogout}>
                            Logout
                        </Button>
                    </li>
                </ul>
            </div>
        </nav>
    )
}