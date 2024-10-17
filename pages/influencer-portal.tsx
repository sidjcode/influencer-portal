import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart, Users, UserPlus, Search, DollarSign, Percent, MousePointer, ShoppingCart, CalendarDays, Video, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DealForm } from "@/components/ui/deal-form"
import axios from 'axios'

interface Influencer {
    id: string;
    channelName: string;
    channelYoutubeId: string;
    category: string;
    avgViews: number;
    callRequired: boolean;
    engagementRate: number;
    topCountriesProportion: number;
    richCountriesFollowers: number;
    maleFollowers: number;
    followerGrowthRate: number;
    englishSpeakingFollowers: number;
    sponsoredVideos: string[];
}

interface Deal {
    id: string;
    influencer: Influencer;
    status: 'Launched' | 'Pending' | 'Completed';
    uploadMonth: string;
    deliverables: string;
    usage: string;
    recut: string;
    exclusivity: string;
    viewGuarantee: {
        amount: number;
        days: number;
    };
    rate: number;
    postDate: string;
    uploadLink: string;
    trackingUrl: string;
    contractedBy: 'DIRECT' | 'AGENCY';
    agencyName?: string;
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
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [callRequired, setCallRequired] = useState(false);
    const [sponsoredVideos, setSponsoredVideos] = useState<string[]>(['']);
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

    const handleDealSubmit = async (dealData: Omit<Deal, 'id' | 'influencer' | 'videos'>) => {
        try {
            await axios.post('/api/deals', dealData)
            fetchDeals()
            setActiveTab("deals")
        } catch (error) {
            console.error('Error submitting deal:', error)
        }
    }

    const handleInfluencerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const influencerData = {
            channelName: formData.get('channelName') as string,
            channelYoutubeId: formData.get('channelYoutubeId') as string,
            category: formData.get('category') as string,
            avgViews: parseInt(formData.get('avgViews') as string, 10),
            callRequired: formData.get('callRequired') === 'on',
            engagementRate: parseFloat(formData.get('engagementRate') as string),
            topCountriesProportion: parseFloat(formData.get('topCountriesProportion') as string),
            richCountriesFollowers: parseInt(formData.get('richCountriesFollowers') as string, 10),
            maleFollowers: parseFloat(formData.get('maleFollowers') as string),
            followerGrowthRate: parseFloat(formData.get('followerGrowthRate') as string),
            englishSpeakingFollowers: parseInt(formData.get('englishSpeakingFollowers') as string, 10),
            sponsoredVideos: [],
        }

        try {
            await axios.post('/api/influencers', influencerData)
            fetchInfluencers()
            setActiveTab("influencers")
        } catch (error) {
            console.error('Error submitting influencer:', error)
        }
    }

    const handleUpdateInfluencer = async (event: React.FormEvent<HTMLFormElement>, influencerId: string) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const updatedData = {
            callRequired: formData.get('callRequired') === 'on',
        }

        try {
            await axios.put(`/api/influencers/${influencerId}`, updatedData)
            fetchInfluencers()
        } catch (error) {
            console.error('Error updating influencer:', error)
        }
    }

    const handleSponsoredVideoSubmit = async (event: React.FormEvent<HTMLFormElement>, influencerId: string) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const videoUrl = formData.get('videoUrl') as string

        const influencer = influencers.find(inf => inf.id === influencerId)
        if (!influencer || influencer.sponsoredVideos.length >= 5) {
            alert("Maximum of 5 sponsored videos allowed.")
            return
        }

        try {
            const updatedVideos = [...influencer.sponsoredVideos, videoUrl]
            await axios.put(`/api/influencers/${influencerId}`, { sponsoredVideos: updatedVideos })
            fetchInfluencers()
        } catch (error) {
            console.error('Error submitting sponsored video:', error)
        }
    }

    const filteredInfluencers = influencers.filter(influencer =>
        influencer.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                        variant={activeTab === "add" ? "default" : "outline"}
                        onClick={() => setActiveTab("add")}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Influencer
                    </Button>
                    <Button
                        variant={activeTab === "update" ? "default" : "outline"}
                        onClick={() => setActiveTab("update")}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Update Influencer
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
                                            <TableHead>YouTube ID</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Avg Views</TableHead>
                                            <TableHead>Engagement Rate</TableHead>
                                            <TableHead>Top Countries</TableHead>
                                            <TableHead>Rich Countries Followers</TableHead>
                                            <TableHead>Male Followers</TableHead>
                                            <TableHead>Follower Growth Rate</TableHead>
                                            <TableHead>English Speaking Followers</TableHead>
                                            <TableHead>Actions</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInfluencers.map((influencer) => (
                                            <TableRow key={influencer.id}>
                                                <TableCell>{influencer.channelName}</TableCell>
                                                <TableCell>{influencer.channelYoutubeId}</TableCell>
                                                <TableCell>{influencer.category}</TableCell>
                                                <TableCell>{influencer.avgViews.toLocaleString()}</TableCell>
                                                <TableCell>{influencer.engagementRate.toFixed(2)}%</TableCell>
                                                <TableCell>{influencer.topCountriesProportion.toFixed(2)}%</TableCell>
                                                <TableCell>{influencer.richCountriesFollowers.toLocaleString()}</TableCell>
                                                <TableCell>{influencer.maleFollowers.toFixed(2)}%</TableCell>
                                                <TableCell>{influencer.followerGrowthRate.toFixed(2)}%</TableCell>
                                                <TableCell>{influencer.englishSpeakingFollowers.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                Update
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle>{influencer.channelName} - Update Influencer</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <form onSubmit={(e) => handleUpdateInfluencer(e, influencer.id)} className="space-y-4">
                                                                    <div className="flex items-center">
                                                                        <Checkbox
                                                                            id={`callRequired-${influencer.id}`}
                                                                            name="callRequired"
                                                                            defaultChecked={influencer.callRequired}
                                                                        />
                                                                        <label htmlFor={`callRequired-${influencer.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                                                                            Onboarding Call Done
                                                                        </label>
                                                                    </div>
                                                                    <Button type="submit">Update Influencer</Button>
                                                                </form>
                                                                <h3 className="text-lg font-semibold mt-4">Sponsored Videos</h3>
                                                                <ul>
                                                                    {influencer.sponsoredVideos.map((video, index) => (
                                                                        <li key={index}>
                                                                            <a href={video} target="_blank" rel="noopener noreferrer">{video}</a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                {influencer.sponsoredVideos.length < 5 && (
                                                                    <form onSubmit={(e) => handleSponsoredVideoSubmit(e, influencer.id)} className="space-y-2">
                                                                        <Input name="videoUrl" placeholder="Enter sponsored video URL" />
                                                                        <Button type="submit">Add Sponsored Video</Button>
                                                                    </form>
                                                                )}
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
                                            <TableHead>Status</TableHead>
                                            <TableHead>Upload Month</TableHead>
                                            <TableHead>Deliverables</TableHead>
                                            <TableHead>View Guarantee</TableHead>
                                            <TableHead>Rate (USD)</TableHead>
                                            <TableHead>Post Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deals.map((deal) => (
                                            <TableRow key={deal.id}>
                                                <TableCell>{deal.influencer.channelName}</TableCell>
                                                <TableCell>{deal.status}</TableCell>
                                                <TableCell>{deal.uploadMonth}</TableCell>
                                                <TableCell>{deal.deliverables}</TableCell>
                                                <TableCell>{deal.viewGuarantee.amount.toLocaleString()} views in {deal.viewGuarantee.days} days</TableCell>
                                                <TableCell>${deal.rate.toLocaleString()}</TableCell>
                                                <TableCell>{new Date(deal.postDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                View Details
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle>{deal.influencer.channelName} - Deal Details</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <h3 className="text-lg font-semibold">Deal Information</h3>
                                                                <p>Status: {deal.status}</p>
                                                                <p>Upload Month: {deal.uploadMonth}</p>
                                                                <p>Deliverables: {deal.deliverables}</p>
                                                                <p>Usage: {deal.usage}</p>
                                                                <p>Recut: {deal.recut}</p>
                                                                <p>Exclusivity: {deal.exclusivity}</p>
                                                                <p>View Guarantee: {deal.viewGuarantee.amount.toLocaleString()} views in {deal.viewGuarantee.days} days</p>
                                                                <p>Rate: ${deal.rate.toLocaleString()} USD</p>
                                                                <p>Post Date: {new Date(deal.postDate).toLocaleDateString()}</p>
                                                                <p>Upload Link: <a href={deal.uploadLink} target="_blank" rel="noopener noreferrer">{deal.uploadLink}</a></p>
                                                                <p>Tracking URL: <a href={deal.trackingUrl} target="_blank" rel="noopener noreferrer">{deal.trackingUrl}</a></p>
                                                                <p>Contracted By: {deal.contractedBy}</p>
                                                                {deal.agencyName && <p>Agency Name: {deal.agencyName}</p>}
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

                {activeTab === "add" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Add Influencer</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>New Influencer Form</CardTitle>
                                <CardDescription>Enter the details of the new influencer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleInfluencerSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700">
                                                Channel Name
                                            </label>
                                            <Input id="channelName" name="channelName" placeholder="Channel name" required />
                                        </div>
                                        <div>
                                            <label htmlFor="channelYoutubeId" className="block text-sm font-medium text-gray-700">
                                                Channel YouTube ID
                                            </label>
                                            <Input id="channelYoutubeId" name="channelYoutubeId" placeholder="e.g., @ChannelName" required />
                                        </div>
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                Category
                                            </label>
                                            <Input id="category" name="category" placeholder="e.g., Technology, Fashion" required />
                                        </div>
                                        <div>
                                            <label htmlFor="avgViews" className="block text-sm font-medium text-gray-700">
                                                Average Views
                                            </label>
                                            <Input id="avgViews" name="avgViews" type="number" placeholder="e.g., 25000" required />
                                        </div>
                                        <div>
                                            <label htmlFor="engagementRate" className="block text-sm font-medium text-gray-700">
                                                Engagement Rate (%)
                                            </label>
                                            <Input id="engagementRate" name="engagementRate" type="number" step="0.01" placeholder="e.g., 5 for 5%" required />
                                        </div>
                                        <div>
                                            <label htmlFor="topCountriesProportion" className="block text-sm font-medium text-gray-700">
                                                Top Countries Proportion (%)
                                            </label>
                                            <Input id="topCountriesProportion" name="topCountriesProportion" type="number" step="0.01" placeholder="e.g., 40 for 40%" required />
                                        </div>
                                        <div>
                                            <label htmlFor="richCountriesFollowers" className="block text-sm font-medium text-gray-700">
                                                Rich Countries Followers
                                            </label>
                                            <Input id="richCountriesFollowers" name="richCountriesFollowers" type="number" placeholder="e.g., 50000" required />
                                        </div>
                                        <div>
                                            <label htmlFor="maleFollowers" className="block text-sm font-medium text-gray-700">
                                                Male Followers (%)
                                            </label>
                                            <Input id="maleFollowers" name="maleFollowers" type="number" step="0.1" placeholder="e.g., 60 for 60%" required />
                                        </div>
                                        <div>
                                            <label htmlFor="followerGrowthRate" className="block text-sm font-medium text-gray-700">
                                                Follower Growth Rate (%)
                                            </label>
                                            <Input id="followerGrowthRate" name="followerGrowthRate" type="number" step="0.01" placeholder="e.g., 5 for 5%" required />
                                        </div>
                                        <div>
                                            <label htmlFor="englishSpeakingFollowers" className="block text-sm font-medium text-gray-700">
                                                English Speaking Followers
                                            </label>
                                            <Input id="englishSpeakingFollowers" name="englishSpeakingFollowers" type="number" placeholder="e.g., 75000" required />
                                        </div>
                                        <div className="flex items-center">
                                            <Checkbox id="callRequired" name="callRequired" />
                                            <label htmlFor="callRequired" className="ml-2 block text-sm font-medium text-gray-700">
                                                Onboarding Call Done
                                            </label>
                                        </div>
                                    </div>
                                    <Button type="submit">Add Influencer</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "update" && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Update Influencer</h2>
                        <div>
                            <label htmlFor="influencerSelect" className="block text-sm font-medium text-gray-700">Select Influencer</label>
                            <Select id="influencerSelect" onValueChange={(value) => setSelectedInfluencer(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Search and select influencer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {influencers.map((inf) => (
                                        <SelectItem key={inf.id} value={inf.id}>{inf.channelName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <h3 className="text-lg font-semibold mt-4">Sponsored Videos</h3>
                        <ul>
                            {selectedInfluencer && selectedInfluencer.sponsoredVideos.map((video, index) => (
                                <li key={index}>
                                    <a href={video} target="_blank" rel="noopener noreferrer">{video}</a>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center mt-4">
                            <Checkbox
                                id="callRequired"
                                name="callRequired"
                                checked={callRequired}
                                onChange={(e) => setCallRequired(e.target.checked)}
                            />
                            <label htmlFor="callRequired" className="ml-2 block text-sm font-medium text-gray-700">
                                Onboarding Call Done
                            </label>
                        </div>
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