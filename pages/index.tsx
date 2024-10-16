import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Welcome to Influencer Portal</h1>
            <p className="mb-4">Manage your influencers and campaigns efficiently.</p>
            <Link href="/influencer-portal">
                <Button>Go to Influencer Portal</Button>
            </Link>
        </div>
    )
}