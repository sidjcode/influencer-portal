import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { BarChart, Users, UserPlus, Search, DollarSign, Percent, MousePointer, ShoppingCart, CalendarDays, Video, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DealForm } from "@/components/ui/deal-form"
import axios from 'axios'

interface DealData {
    influencerId: string;
    contractedBy: 'DIRECT' | 'AGENCY';
    agencyName?: string;
    pricingType: 'FIXED' | 'CPM';
    fixedCost?: number;
    cpm?: number;
    priceCeiling?: number;
    viewGuarantee?: number;
    viewGuaranteeDays?: number;
    postDate: Date;
}

interface Influencer {
    id: string;
    channelName: string;
    category: string;
    trackingUrl: string;
}

interface Deal {
    id: string;
    influencer: Influencer;
    contractedBy: 'DIRECT' | 'AGENCY';
    pricingType: 'FIXED' | 'CPM';
    fixedCost?: number;
    cpm?: number;
    priceCeiling?: number;
    viewGuarantee?: number;
    viewGuaranteeDays?: number;
    postDate: string;
    videos: Array<{
        id: string;
        title: string;
        views: number;
        likes: number;
        comments: number;
    }>;
}

interface CurrentMonthData {
    postedInfluencers: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    roi: number;
    cost: number;
    agencyFee: number;
}

export default function InfluencerPortal() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [currentDate, setCurrentDate] = useState(new Date())
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData>({
        postedInfluencers: 0,
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        roi: 0,
        cost: 0,
        agencyFee: 0,
    })

    useEffect(() => {
        fetchInfluencers()
        fetchDeals()
        fetchCurrentMonthData()
    }, [])

    const fetchInfluencers = async () => {
        try {
            const response = await axios.get('/api/influencers')
            setInfluencers(response.data)
        } catch (error) {
            console.error('Error fetching influencers:', error)
        }
    }

    const fetchDeals = async () => {
        try {
            const response = await axios.get('/api/deals')
            setDeals(response.data)
        } catch (error) {
            console.error('Error fetching deals:', error)
        }
    }

    const fetchCurrentMonthData = async () => {
        try {
            const response = await axios.get('/api/current-month-data')
            setCurrentMonthData(response.data)
        } catch (error) {
            console.error('Error fetching current month data:', error)
        }
    }

    const handleDealSubmit = async (dealData: DealData) => {
        try {
            await axios.post('/api/deals', dealData)
            fetchDeals()
            setActiveTab("deals")
        } catch (error) {
            console.error('Error submitting deal:', error)
        }
    }

    const filteredInfluencers = influencers.filter(influencer =>
        influencer.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getInfluencerVideos = (influencerId: string) => {
        return deals
            .filter(deal => deal.influencer.id === influencerId)
            .flatMap(deal => deal.videos)
    }

    const getInfluencersForDate = (date: Date) => {
        return deals.filter(deal => {
            const postDate = new Date(deal.postDate)
            return postDate.toDateString() === date.toDateString()
        }).map(deal => deal.influencer)
    }

    const getInfluencerCountForDate = (date: Date) => {
        return getInfluencersForDate(date).length
    }

    const getDaysAround = (date: Date, daysAround: number) => {
        const days = []
        for (let i = -daysAround; i <= daysAround; i++) {
            const day = new Date(date)
            day.setDate(date.getDate() + i)
            days.push(day)
        }
        return days
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const nextWeek = () => {
        const nextDate = new Date(currentDate)
        nextDate.setDate(currentDate.getDate() + 7)
        setCurrentDate(nextDate)
    }

    const prevWeek = () => {
        const prevDate = new Date(currentDate)
        prevDate.setDate(currentDate.getDate() - 7)
        setCurrentDate(prevDate)
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-background border-b p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Influencer Portal</h1>
                    <div className="flex items-center">
                        <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="max-w-sm"
                            placeholder="Search influencers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto bg-background p-6">
                <div className="flex space-x-2 mb-4">
                    <Button
                        variant={activeTab === "dashboard" ? "default" : "outline"}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        <BarChart className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button
                        variant={activeTab === "influencers" ? "default" : "outline"}
                        onClick={() => setActiveTab("influencers")}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Influencers
                    </Button>
                    <Button
                        variant={activeTab === "deals" ? "default" : "outline"}
                        onClick={() => setActiveTab("deals")}
                    >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Deals
                    </Button>
                    <Button
                        variant={activeTab === "calendar" ? "default" : "outline"}
                        onClick={() => setActiveTab("calendar")}
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Calendar
                    </Button>
                    <Button
                        variant={activeTab === "videos" ? "default" : "outline"}
                        onClick={() => setActiveTab("videos")}
                    >
                        <Video className="mr-2 h-4 w-4" />
                        Influencer Videos
                    </Button>
                    <Button
                        variant={activeTab === "add" ? "default" : "outline"}
                        onClick={() => setActiveTab("add")}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Influencer
                    </Button>
                    <Button
                        variant={activeTab === "addDeal" ? "default" : "outline"}
                        onClick={() => setActiveTab("addDeal")}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Deal
                    </Button>
                </div>

                {activeTab === "dashboard" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Current Month Performance</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Posted Influencers</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{currentMonthData.postedInfluencers}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{currentMonthData.totalViews.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{currentMonthData.totalClicks.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{currentMonthData.totalConversions.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">ROI</CardTitle>
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{currentMonthData.roi}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Cost</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${currentMonthData.cost.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Agency Fee</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${currentMonthData.agencyFee.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === "influencers" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Influencers</h2>
                        <Card>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Channel Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Tracking URL</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInfluencers.map((influencer) => (
                                            <TableRow key={influencer.id}>
                                                <TableCell>{influencer.channelName}</TableCell>
                                                <TableCell>{influencer.category}</TableCell>
                                                <TableCell>{influencer.trackingUrl}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                View Details
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent  className="max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle>{influencer.channelName} - Performance Details</DialogTitle>
                                                                <DialogDescription>
                                                                    Overall performance metrics and individual video statistics
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle>Video Performance</CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent>
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>Title</TableHead>
                                                                                    <TableHead>Views</TableHead>
                                                                                    <TableHead>Likes</TableHead>
                                                                                    <TableHead>Comments</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {getInfluencerVideos(influencer.id).map((video) => (
                                                                                    <TableRow key={video.id}>
                                                                                        <TableCell>{video.title}</TableCell>
                                                                                        <TableCell>{video.views.toLocaleString()}</TableCell>
                                                                                        <TableCell>{video.likes.toLocaleString()}</TableCell>
                                                                                        <TableCell>{video.comments.toLocaleString()}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "deals" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Deals</h2>
                        <Card>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Influencer</TableHead>
                                            <TableHead>Contracted By</TableHead>
                                            <TableHead>Pricing Type</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>View Guarantee</TableHead>
                                            <TableHead>Post Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deals.map((deal) => (
                                            <TableRow key={deal.id}>
                                                <TableCell>{deal.influencer.channelName}</TableCell>
                                                <TableCell>{deal.contractedBy}</TableCell>
                                                <TableCell>{deal.pricingType}</TableCell>
                                                <TableCell>
                                                    {deal.pricingType === 'FIXED'
                                                        ? `$${deal.fixedCost}`
                                                        : `$${deal.cpm} CPM (Max: $${deal.priceCeiling})`}
                                                </TableCell>
                                                <TableCell>{deal.viewGuarantee ? `${deal.viewGuarantee} views in ${deal.viewGuaranteeDays} days` : 'N/A'}</TableCell>
                                                <TableCell>{new Date(deal.postDate).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "calendar" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Posting Schedule</h2>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>
                                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </CardTitle>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={prevWeek}>
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev Week
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={nextWeek}>
                                        Next Week <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-1/3">Date</TableHead>
                                            <TableHead>Influencers Posting</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getDaysAround(currentDate, 3).map((date) => (
                                            <TableRow key={date.toISOString()} className={date.toDateString() === currentDate.toDateString() ? 'bg-muted' : ''}>
                                                <TableCell className="font-medium">{formatDate(date)}</TableCell>
                                                <TableCell>
                                                    {getInfluencersForDate(date).map(inf => inf.channelName).join(", ") || 'No posts scheduled'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "videos" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Influencer Videos</h2>
                        <Card>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Influencer</TableHead>
                                            <TableHead>Video Title</TableHead>
                                            <TableHead>Views</TableHead>
                                            <TableHead>Likes</TableHead>
                                            <TableHead>Comments</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deals.flatMap(deal =>
                                            deal.videos.map(video => (
                                                <TableRow key={video.id}>
                                                    <TableCell>{deal.influencer.channelName}</TableCell>
                                                    <TableCell>{video.title}</TableCell>
                                                    <TableCell>{video.views.toLocaleString()}</TableCell>
                                                    <TableCell>{video.likes.toLocaleString()}</TableCell>
                                                    <TableCell>{video.comments.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "add" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Add Influencer</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>New Influencer Form</CardTitle>
                                <CardDescription>Enter the details of the new influencer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700">
                                                Channel Name
                                            </label>
                                            <Input id="channelName" placeholder="Channel name" />
                                        </div>
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                Category
                                            </label>
                                            <Input id="category" placeholder="e.g., Technology, Fashion" />
                                        </div>
                                        <div>
                                            <label htmlFor="trackingUrl" className="block text-sm font-medium text-gray-700">
                                                Tracking URL
                                            </label>
                                            <Input id="trackingUrl" placeholder="https://example.com/influencer" />
                                        </div>
                                    </div>
                                    <Button type="submit">Add Influencer</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "addDeal" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Add Deal</h2>
                        <DealForm onSubmit={handleDealSubmit} />
                    </>
                )}
            </main>
        </div>
    )
}