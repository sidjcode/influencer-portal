import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

export function Navigation() {
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('authToken')
        router.push('/login')
    }

    const linkClass = (path: string) =>
        `text-primary hover:text-primary/80 text-sm pb-1 border-b-2 border-transparent 
        hover:border-primary transition-all duration-200 
        ${router.pathname === path ? "font-semibold border-primary" : ""}`

    return (
        <nav className="bg-muted text-muted-foreground p-3">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={100}
                        height={40}
                        className="mr-2"
                    />
                </Link>
                <ul className="flex items-center space-x-6">
                    <li>
                        <Link href="/dashboard" className={linkClass("/dashboard")}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/influencers" className={linkClass("/influencers")}>
                            Influencers
                        </Link>
                    </li>
                    <li>
                        <Link href="/deals" className={linkClass("/deals")}>
                            Deals
                        </Link>
                    </li>
                    <li>
                        <Link href="/videos" className={linkClass("/videos")}>
                            Videos
                        </Link>
                    </li>
                    <li>
                        <Link href="/agencies" className={linkClass("/agencies")}>
                            Agencies
                        </Link>
                    </li>
                    <li>
                        <Link href="/reports" className={linkClass("/reports")}>
                            Reports
                        </Link>
                    </li>
                    <li>
                        <Link href="/calendar" className={linkClass("/calendar")}>
                            Calendar
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            className="text-secondary hover:text-secondary/80 text-sm pb-1 border-b-2 border-transparent
                            hover:border-secondary transition-all duration-200"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    )
}