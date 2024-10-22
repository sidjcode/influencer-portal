import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart, Users, UserPlus, Search, DollarSign, Percent, MousePointer, ShoppingCart, CalendarDays, Video, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
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

interface InfluencerPortalProps {
    initialInfluencers: Influencer[];
    initialDeals: Deal[];
    initialCurrentMonthData: CurrentMonthData;
}

export default function InfluencerPortal({ initialInfluencers, initialDeals, initialCurrentMonthData }: InfluencerPortalProps) {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [searchTerm, setSearchTerm] = useState("")
    const [influencers, setInfluencers] = useState<Influencer[]>(initialInfluencers)
    const [deals, setDeals] = useState<Deal[]>(initialDeals)
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData>(initialCurrentMonthData)
    const [callRequired, setCallRequired] = useState(false)
    const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
    const [sponsoredVideos, setSponsoredVideos] = useState<string[]>(['']);
    const [newInfluencer, setNewInfluencer] = useState({ channelName: '', category: '', trackingUrl: '' })
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!influencers || influencers.length === 0) {
            fetchInfluencers()
        }
        if (!deals || deals.length === 0) {
            fetchDeals()
        }
        if (!currentMonthData || Object.keys(currentMonthData).length === 0) {
            fetchCurrentMonthData()
        }
    }, [])

    const fetchInfluencers = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/influencers')
            setInfluencers(response.data)
        } catch (error) {
            console.error('Error fetching influencers:', error)
            toast({
                title: "Error",
                description: "Failed to fetch influencers. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchDeals = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/deals')
            setDeals(response.data)
        } catch (error) {
            console.error('Error fetching deals:', error)
            toast({
                title: "Error",
                description: "Failed to fetch deals. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCurrentMonthData = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/current-month-data')
            setCurrentMonthData(response.data)
        } catch (error) {
            console.error('Error fetching current month data:', error)
            toast({
                title: "Error",
                description: "Failed to fetch current month data. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDealSubmit = async (dealData: Omit<Deal, 'id' | 'influencer' | 'videos'>) => {
        setIsLoading(true)
        try {
            const response = await axios.post('/api/deals', dealData)
            setDeals([...deals, response.data])
            setActiveTab("deals")
            toast({
                title: "Success",
                description: "Deal added successfully.",
            })
        } catch (error) {
            console.error('Error submitting deal:', error)
            toast({
                title: "Error",
                description: "Failed to add deal. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInfluencerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const influencerData = {
            channelName: formData.get('channelName') as string,
            channelYoutubeId: formData.get('channelYoutubeId') as string,
            category: formData.get('category') as string,
            avgViews: parseInt(formData.get('avgViews') as string, 10),
            callRequired: callRequired,
            engagementRate: parseFloat(formData.get('engagementRate') as string),
            topCountriesProportion: parseFloat(formData.get('topCountriesProportion') as string),
            richCountriesFollowers: parseInt(formData.get('richCountriesFollowers') as string, 10),
            maleFollowers: parseFloat(formData.get('maleFollowers') as string),
            followerGrowthRate: parseFloat(formData.get('followerGrowthRate') as string),
            englishSpeakingFollowers: parseInt(formData.get('englishSpeakingFollowers') as string, 10),
            sponsoredVideos: [],
        }

        try {
            const response = await axios.post('/api/influencers', influencerData)
            setInfluencers([...influencers, response.data])
            setActiveTab("influencers")
            toast({
                title: "Success",
                description: "Influencer added successfully.",
            })
        } catch (error) {
            console.error('Error submitting influencer:', error)
            toast({
                title: "Error",
                description: "Failed to add influencer. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const filteredInfluencers = influencers ? influencers.filter(influencer =>
        (influencer.channelName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (influencer.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    ) : []

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
                        variant={activeTab === "addDeal" ? "default" : "outline"}
                        onClick={() => setActiveTab("addDeal")}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Deal
                    </Button>
                    <Button
                        variant={activeTab === "update" ? "default" : "outline"}
                        onClick={() => setActiveTab("update")}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Update Influencer
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
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
                                            <div className="text-2xl font-bold">{currentMonthData?.postedInfluencers}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                            <BarChart className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{currentMonthData?.totalViews.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{currentMonthData?.totalClicks.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{currentMonthData?.totalConversions.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">ROI</CardTitle>
                                            <Percent className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{currentMonthData?.roi}%</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Cost</CardTitle>
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">${currentMonthData?.cost.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Agency Fee</CardTitle>
                                            <DollarSign className="h-4 w-4  text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">${currentMonthData?.agencyFee.toLocaleString()}</div>
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
                                                        <TableCell>{influencer.category || 'N/A'}</TableCell>
                                                        <TableCell>{(influencer.avgViews || 0).toLocaleString()}</TableCell>
                                                        <TableCell>{(influencer.engagementRate || 0).toFixed(2)}%</TableCell>
                                                        <TableCell>{(influencer.topCountriesProportion || 0).toFixed(2)}%</TableCell>
                                                        <TableCell>{(influencer.richCountriesFollowers || 0).toLocaleString()}</TableCell>
                                                        <TableCell>{(influencer.maleFollowers || 0).toFixed(2)}%</TableCell>
                                                        <TableCell>{(influencer.followerGrowthRate || 0).toFixed(2)}%</TableCell>
                                                        <TableCell>{(influencer.englishSpeakingFollowers || 0).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Button variant="outline" size="sm">
                                                                View Details
                                                            </Button>
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
                                                {deals && deals.length > 0 ? (
                                                    deals.map((deal) => (
                                                        <TableRow key={deal.id}>
                                                            <TableCell>{deal.influencer.channelName}</TableCell>
                                                            <TableCell>{deal.status}</TableCell>
                                                            <TableCell>{deal.uploadMonth}</TableCell>
                                                            <TableCell>{deal.deliverables}</TableCell>
                                                            <TableCell>{deal.viewGuarantee?.amount?.toLocaleString() ?? 'N/A'} views in {deal.viewGuarantee?.days ?? 'N/A'} days</TableCell>
                                                            <TableCell>${deal.rate?.toLocaleString() ?? 'N/A'}</TableCell>
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
                                                                            <p>View Guarantee: {deal.viewGuarantee?.amount?.toLocaleString() ?? 'N/A'} views in {deal.viewGuarantee?.days ?? 'N/A'} days</p>
                                                                            <p>Rate: ${deal.rate?.toLocaleString() ?? 'N/A'} USD</p>
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
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center">No deals available</TableCell>
                                                    </TableRow>
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
                                                    <Checkbox
                                                        id="callRequired"
                                                        name="callRequired"
                                                        checked={callRequired}
                                                        onCheckedChange={(checked) => setCallRequired(checked as boolean)}
                                                    />
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

                        {activeTab === "addDeal" && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Add Deal</h2>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>New Deal Form</CardTitle>
                                        <CardDescription>Enter the details of the new deal</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const dealData = Object.fromEntries(formData.entries());
                                            handleDealSubmit(dealData as any);
                                        }} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="influencerId" className="block text-sm font-medium text-gray-700">
                                                        Influencer
                                                    </label>
                                                    <Select name="influencerId" required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Influencer" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {influencers && influencers.length > 0 ? (
                                                                influencers.map((influencer) => (
                                                                    <SelectItem key={influencer.id} value={influencer.id}>
                                                                        {influencer.channelName}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-influencers" disabled>No influencers available</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                        Status
                                                    </label>
                                                    <Select name="status" required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Launched">Launched</SelectItem>
                                                            <SelectItem value="Pending">Pending</SelectItem>
                                                            <SelectItem value="Completed">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label htmlFor="uploadMonth" className="block text-sm font-medium text-gray-700">
                                                        Upload Month
                                                    </label>
                                                    <Input id="uploadMonth" name="uploadMonth" type="month" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700">
                                                        Deliverables
                                                    </label>
                                                    <Input id="deliverables" name="deliverables" placeholder="e.g., 1 YouTube video" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="usage" className="block text-sm font-medium text-gray-700">
                                                        Usage
                                                    </label>
                                                    <Input id="usage" name="usage" placeholder="e.g., 6 months" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="recut" className="block text-sm font-medium text-gray-700">
                                                        Recut
                                                    </label>
                                                    <Input id="recut" name="recut" placeholder="e.g., Yes/No" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="exclusivity" className="block text-sm font-medium text-gray-700">
                                                        Exclusivity
                                                    </label>
                                                    <Input id="exclusivity" name="exclusivity" placeholder="e.g., 30 days" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="viewGuaranteeAmount" className="block text-sm font-medium text-gray-700">
                                                        View Guarantee Amount
                                                    </label>
                                                    <Input id="viewGuaranteeAmount" name="viewGuaranteeAmount" type="number" placeholder="e.g., 100000" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="viewGuaranteeDays" className="block text-sm font-medium text-gray-700">
                                                        View Guarantee Days
                                                    </label>
                                                    <Input id="viewGuaranteeDays" name="viewGuaranteeDays" type="number" placeholder="e.g., 30" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                                                        Rate (USD)
                                                    </label>
                                                    <Input id="rate" name="rate" type="number" placeholder="e.g., 5000" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="postDate" className="block text-sm font-medium text-gray-700">
                                                        Post Date
                                                    </label>
                                                    <Input id="postDate" name="postDate" type="date" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="uploadLink" className="block text-sm font-medium text-gray-700">
                                                        Upload Link
                                                    </label>
                                                    <Input id="uploadLink" name="uploadLink" type="url" placeholder="https://..." required />
                                                </div>
                                                <div>
                                                    <label htmlFor="trackingUrl" className="block text-sm font-medium text-gray-700">
                                                        Tracking URL
                                                    </label>
                                                    <Input id="trackingUrl" name="trackingUrl" type="url" placeholder="https://..." required />
                                                </div>
                                                <div>
                                                    <label htmlFor="contractedBy" className="block text-sm font-medium text-gray-700">
                                                        Contracted By
                                                    </label>
                                                    <Select name="contractedBy" required>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Contracted By" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="DIRECT">Direct</SelectItem>
                                                            <SelectItem value="AGENCY">Agency</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                                                        Agency Name (if applicable)
                                                    </label>
                                                    <Input id="agencyName" name="agencyName" placeholder="Agency name" />
                                                </div>
                                            </div>
                                            <Button type="submit">Add Deal</Button>
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
                                    <Select onValueChange={(value) => {
                                        const influencer = influencers && influencers.find((inf) => inf.id === value);
                                        setSelectedInfluencer(influencer || null);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search and select influencer..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {influencers && influencers.length > 0 ? (
                                                influencers.map((inf) => (
                                                    <SelectItem key={inf.id} value={inf.id}>{inf.channelName}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-influencers" disabled>No influencers available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedInfluencer && (
                                    <>
                                        <h3 className="text-lg font-semibold mt-4">Sponsored Videos</h3>
                                        {selectedInfluencer.sponsoredVideos && selectedInfluencer.sponsoredVideos.length > 0 ? (
                                            <ul>
                                                {selectedInfluencer.sponsoredVideos.map((video, index) => (
                                                    <li key={index}>
                                                        <a href={video} target="_blank" rel="noopener noreferrer">{video}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No sponsored videos available.</p>
                                        )}

                                        <div className="flex items-center mt-4">
                                            <Checkbox
                                                id="callRequiredUpdate"
                                                name="callRequiredUpdate"
                                                checked={selectedInfluencer.callRequired}
                                                onCheckedChange={(checked) => {
                                                    setSelectedInfluencer({
                                                        ...selectedInfluencer,
                                                        callRequired: checked as boolean
                                                    });
                                                }}
                                            />
                                            <label htmlFor="callRequiredUpdate" className="ml-2 block text-sm font-medium text-gray-700">
                                                Onboarding Call Done
                                            </label>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}