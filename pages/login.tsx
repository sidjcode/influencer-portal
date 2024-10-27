import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await login(username, password)
        if (success) {
            router.push('/dashboard')
        } else {
            setError('Invalid username or password')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={100}
                            height={40}
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-primary">Login to Influencer Platform</CardTitle>
                    <CardDescription className="text-center text-secondary">
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md border-secondary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md border-secondary"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}