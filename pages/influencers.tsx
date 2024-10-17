import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Influencer {
    id: number
    channelName: string
    category: string | null
    trackingUrl: string
}

export default function InfluencersPage() {
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [newInfluencer, setNewInfluencer] = useState({ channelName: '', category: '', trackingUrl: '' })

    useEffect(() => {
        fetchInfluencers()
    }, [])

    const fetchInfluencers = async () => {
        const response = await fetch('/api/influencers')
        const data = await response.json()
        setInfluencers(data)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewInfluencer({ ...newInfluencer, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const response = await fetch('/api/influencers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newInfluencer),
        })
        if (response.ok) {
            setNewInfluencer({ channelName: '', category: '', trackingUrl: '' })
            fetchInfluencers()
        }
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Influencer</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            name="channelName"
                            value={newInfluencer.channelName}
                            onChange={handleInputChange}
                            placeholder="Channel Name"
                            required
                        />
                        <Input
                            name="category"
                            value={newInfluencer.category}
                            onChange={handleInputChange}
                            placeholder="Category"
                        />
                        <Input
                            name="trackingUrl"
                            value={newInfluencer.trackingUrl}
                            onChange={handleInputChange}
                            placeholder="Tracking URL"
                            required
                        />
                        <Button type="submit">Add Influencer</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Influencers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Channel Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Tracking URL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {influencers.map((influencer) => (
                                <TableRow key={influencer.id}>
                                    <TableCell>{influencer.channelName}</TableCell>
                                    <TableCell>{influencer.category}</TableCell>
                                    <TableCell>{influencer.trackingUrl}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}