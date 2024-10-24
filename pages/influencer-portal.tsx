import React, { useState, useEffect, useMemo, useCallback } from "react"
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
import { InfluencerUploader } from "@/components/InfluencerUploader"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { InfoIcon } from "lucide-react"

// Interfaces remain unchanged
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
    trackingUrl: string;
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
    initialInfluencers?: Influencer[];
    initialDeals?: Deal[];
    initialCurrentMonthData?: CurrentMonthData;
}

export default function InfluencerPortal({ initialInfluencers, initialDeals, initialCurrentMonthData }: InfluencerPortalProps) {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [searchTerm, setSearchTerm] = useState("")
    const [influencers, setInfluencers] = useState<Influencer[]>(initialInfluencers || [])
    const [deals, setDeals] = useState<Deal[]>(initialDeals || [])
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData>(initialCurrentMonthData || {
        postedInfluencers: 0,
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        roi: 0,
        cost: 0,
        agencyFee: 0
    })
    const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
    const [sponsoredVideos, setSponsoredVideos] = useState<string[]>(['']);
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const { toast } = useToast()

    const [newInfluencer, setNewInfluencer] = useState<Omit<Influencer, 'id' | 'sponsoredVideos'>>({
        channelName: '',
        channelYoutubeId: '',
        category: '', // Change this from null to an empty string
        avgViews: 0,
        callRequired: false,
        engagementRate: 0,
        topCountriesProportion: 0,
        richCountriesFollowers: 0,
        maleFollowers: 0,
        followerGrowthRate: 0,
        englishSpeakingFollowers: 0,
        trackingUrl: ''
    })

    const fetchInfluencers = useCallback(async () => {
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
    }, [toast])

    const fetchDeals = useCallback(async () => {
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
    }, [toast])

    const fetchCurrentMonthData = useCallback(async () => {
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
    }, [toast])

    useEffect(() => {
        if (!initialInfluencers || initialInfluencers.length === 0) {
            fetchInfluencers()
        }
        if (!initialDeals || initialDeals.length === 0) {
            fetchDeals()
        }
        if (!initialCurrentMonthData || Object.keys(initialCurrentMonthData).length === 0) {
            fetchCurrentMonthData()
        }
    }, [initialInfluencers, initialDeals, initialCurrentMonthData, fetchInfluencers, fetchDeals, fetchCurrentMonthData])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        setNewInfluencer(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }))
    }, [])

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {}
        if (!newInfluencer.channelName) newErrors.channelName = "Channel name is required"
        if (!newInfluencer.channelYoutubeId) newErrors.channelYoutubeId = "YouTube ID is required"
        if (newInfluencer.avgViews < 0) newErrors.avgViews = "Average views must be positive"
        if (newInfluencer.engagementRate < 0 || newInfluencer.engagementRate > 100) newErrors.engagementRate = "Engagement rate must be between 0 and 100"
        if (newInfluencer.topCountriesProportion < 0 || newInfluencer.topCountriesProportion > 100) newErrors.topCountriesProportion = "Top countries proportion must be between 0 and 100"
        if (newInfluencer.maleFollowers < 0 || newInfluencer.maleFollowers > 100) newErrors.maleFollowers = "Male followers percentage must be between 0 and 100"
        if (!newInfluencer.trackingUrl) newErrors.trackingUrl = "Tracking URL is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [newInfluencer])

    const handleInfluencerSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!validateForm()) return
        setShowConfirmDialog(true)
    }, [validateForm])

    const confirmSubmit = useCallback(async () => {
        setIsSubmitting(true)
        setShowConfirmDialog(false)
        try {
            const response = await axios.post('/api/influencers', newInfluencer)
            setInfluencers(prev => [...prev, response.data])
            setNewInfluencer({
                channelName: '',
                channelYoutubeId: '',
                category: '',
                avgViews: 0,
                callRequired: false,
                engagementRate: 0,
                topCountriesProportion: 0,
                richCountriesFollowers: 0,
                maleFollowers: 0,
                followerGrowthRate: 0,
                englishSpeakingFollowers: 0,
                trackingUrl: ''
            })
            toast({
                title: "Success",
                description: "Influencer added successfully",
            })
        } catch (error) {
            console.error('Error adding influencer:', error)
            let errorMessage = "Failed to add influencer. Please try again."
            if (axios.isAxiosError(error) && error.response) {
                console.error('Server response:', error.response.data)
                errorMessage = error.response.data.error || errorMessage
                if (error.response.data.details) {
                    console.error('Error details:', error.response.data.details)
                }
            }
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }, [newInfluencer, toast])

    const handleDealSubmit = useCallback(async (dealData: Omit<Deal, 'id' | 'influencer' | 'videos'>) => {
        setIsLoading(true)
        try {
            const response = await axios.post('/api/deals', dealData)
            setDeals(prev => [...prev, response.data])
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
    }, [toast])

    const filteredInfluencers = useMemo(() =>
            influencers && influencers.length > 0
                ? influencers.filter(influencer =>
                    influencer.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    influencer.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                : [],
        [influencers, searchTerm]
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
                    <Button
                        variant={activeTab === "upload" ? "default" : "outline"}
                        onClick={() => setActiveTab("upload")}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Influencers
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
                                <div className="grid gap-4 md:grid-cols-2  lg:grid-cols-4">
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
                                            <DollarSign className="h-4 w-4  text-muted-foreground" />
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
                                                        <TableCell>{influencer.category || 'N/A'}</TableCell>
                                                        <TableCell>{influencer.avgViews.toLocaleString()}</TableCell>
                                                        <TableCell>{influencer.engagementRate.toFixed(2)}%</TableCell>
                                                        <TableCell>{influencer.topCountriesProportion.toFixed(2)}%</TableCell>
                                                        <TableCell>{influencer.richCountriesFollowers.toLocaleString()}</TableCell>
                                                        <TableCell>{influencer.maleFollowers.toFixed(2)}%</TableCell>
                                                        <TableCell>{influencer.followerGrowthRate.toFixed(2)}%</TableCell>
                                                        <TableCell>{influencer.englishSpeakingFollowers.toLocaleString()}</TableCell>
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="channelName">Channel Name</Label>
                                                    <Input
                                                        id="channelName"
                                                        name="channelName"
                                                        value={newInfluencer.channelName}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter channel name"
                                                        required
                                                    />
                                                    {errors.channelName && <p className="text-red-500 text-xs">{errors.channelName}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="channelYoutubeId">Channel YouTube ID</Label>
                                                    <Input
                                                        id="channelYoutubeId"
                                                        name="channelYoutubeId"
                                                        value={newInfluencer.channelYoutubeId}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., @ChannelName"
                                                        required
                                                    />
                                                    {errors.channelYoutubeId && <p className="text-red-500 text-xs">{errors.channelYoutubeId}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category</Label>
                                                    <Input
                                                        id="category"
                                                        name="category"
                                                        value={newInfluencer.category || ''} // Use empty string as fallback
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., Technology, Fashion"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="avgViews">Average Views</Label>
                                                    <Input
                                                        id="avgViews"
                                                        name="avgViews"
                                                        type="number"
                                                        value={newInfluencer.avgViews}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 25000"
                                                        required
                                                    />
                                                    {errors.avgViews && <p className="text-red-500 text-xs">{errors.avgViews}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="engagementRate">
                                                        Engagement Rate (%)
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <InfoIcon className="h-4 w-4 inline-block ml-1" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Average percentage of viewers who engage with the content</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </Label>
                                                    <Input
                                                        id="engagementRate"
                                                        name="engagementRate"
                                                        type="number"
                                                        step="0.01"
                                                        value={newInfluencer.engagementRate}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 5 for 5%"
                                                        required
                                                    />
                                                    {errors.engagementRate && <p className="text-red-500 text-xs">{errors.engagementRate}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="topCountriesProportion">
                                                        Top Countries Proportion (%)
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <InfoIcon className="h-4 w-4 inline-block ml-1" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Percentage of audience from the influencer's top countries</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </Label>
                                                    <Input
                                                        id="topCountriesProportion"
                                                        name="topCountriesProportion"
                                                        type="number"
                                                        step="0.01"
                                                        value={newInfluencer.topCountriesProportion}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 40 for 40%"
                                                        required
                                                    />
                                                    {errors.topCountriesProportion && <p className="text-red-500 text-xs">{errors.topCountriesProportion}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="richCountriesFollowers">Rich Countries Followers</Label>
                                                    <Input
                                                        id="richCountriesFollowers"
                                                        name="richCountriesFollowers"
                                                        type="number"
                                                        value={newInfluencer.richCountriesFollowers}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 50000"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="maleFollowers">Male Followers (%)</Label>
                                                    <Input
                                                        id="maleFollowers"
                                                        name="maleFollowers"
                                                        type="number"
                                                        step="0.1"
                                                        value={newInfluencer.maleFollowers}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 60 for 60%"
                                                        required
                                                    />
                                                    {errors.maleFollowers && <p className="text-red-500 text-xs">{errors.maleFollowers}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="followerGrowthRate">Follower Growth Rate (%)</Label>
                                                    <Input
                                                        id="followerGrowthRate"
                                                        name="followerGrowthRate"
                                                        type="number"
                                                        step="0.01"
                                                        value={newInfluencer.followerGrowthRate}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 5 for 5%"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="englishSpeakingFollowers">English Speaking Followers</Label>
                                                    <Input
                                                        id="englishSpeakingFollowers"
                                                        name="englishSpeakingFollowers"
                                                        type="number"
                                                        value={newInfluencer.englishSpeakingFollowers}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., 75000"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="trackingUrl">Tracking URL</Label>
                                                    <Input
                                                        id="trackingUrl"
                                                        name="trackingUrl"
                                                        value={newInfluencer.trackingUrl}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter tracking URL"
                                                        required
                                                    />
                                                    {errors.trackingUrl && <p className="text-red-500 text-xs">{errors.trackingUrl}</p>}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="callRequired"
                                                        name="callRequired"
                                                        checked={newInfluencer.callRequired}
                                                        onCheckedChange={(checked) => setNewInfluencer(prev => ({ ...prev, callRequired: checked as boolean }))}
                                                    />
                                                    <Label htmlFor="callRequired">Onboarding Call Required</Label>
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? "Adding..." : "Add Influencer"}
                                            </Button>
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
                                            // Add logic to handle deal submission
                                        }} className="space-y-4">
                                            {/* Add form fields for deal creation */}
                                            <Button type="submit">Add Deal</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {activeTab === "update" && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Update Influencer</h2>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Update Influencer Form</CardTitle>
                                        <CardDescription>Update the details of an existing influencer</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            // Add logic to handle influencer update
                                        }} className="space-y-4">
                                            {/* Add form fields for influencer update */}
                                            <Button type="submit">Update Influencer</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {activeTab === "upload" && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Upload Influencers</h2>
                                        <InfluencerUploader onUploadSuccess={fetchInfluencers} />
                            </>
                        )}
                    </>
                )}
            </main>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Addition</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to add this influencer?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Confirm"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}