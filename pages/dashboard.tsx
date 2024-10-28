import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, DollarSign, MousePointer, ShoppingCart, Percent } from "lucide-react"
import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'
import { toast } from "@/components/ui/use-toast"

interface CurrentMonthData {
    postedInfluencers: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    roi: number;
    cost: number;
    agencyFee: number;
}

interface Video {
    id: number;
    viewCount: number;
    cost: number;
    influencerId: number;
    postDate: string;
}

interface Deal {
    id: number;
    agencyId: number | null;
    totalCost: number;
}

interface Agency {
    id: number;
    feeStructure: {
        percentage?: number;
        minimumFee?: number;
    };
}

const AnimatedValue: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2 }) => {
    const animatedValue = useCountUp(value, duration)
    return <>{animatedValue.toLocaleString()}</>
}

export default function Dashboard() {
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const currentDate = new Date()
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

            // Fetch videos for the current month
            const videosResponse = await fetch(`/api/videos?startDate=${firstDayOfMonth.toISOString()}&endDate=${lastDayOfMonth.toISOString()}`)
            if (!videosResponse.ok) {
                throw new Error(`HTTP error! status: ${videosResponse.status}`)
            }
            const videos: Video[] = await videosResponse.json()
            console.log('Fetched videos:', videos)

            // Fetch all deals
            const dealsResponse = await fetch('/api/deals')
            if (!dealsResponse.ok) {
                throw new Error(`HTTP error! status: ${dealsResponse.status}`)
            }
            const deals: Deal[] = await dealsResponse.json()
            console.log('Fetched deals:', deals)

            // Fetch all agencies
            const agenciesResponse = await fetch('/api/agencies')
            if (!agenciesResponse.ok) {
                throw new Error(`HTTP error! status: ${agenciesResponse.status}`)
            }
            const agencies: Agency[] = await agenciesResponse.json()
            console.log('Fetched agencies:', agencies)

            // Calculate metrics
            const postedInfluencers = new Set(videos.map(video => video.influencerId)).size
            const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
            const totalClicks = Math.round(totalViews * 0.015) // 1.5% of views
            const totalConversions = Math.round(totalClicks * 0.075) // 7.5% of clicks
            const cost = videos.reduce((sum, video) => sum + (video.cost || 0), 0)
            const roi = cost > 0 ? ((totalConversions * 150 / cost) * 100).toFixed(2) : '0'

            // Calculate agency fee
            let agencyFee = 0
            for (const deal of deals) {
                if (deal.agencyId) {
                    const agency = agencies.find(a => a.id === deal.agencyId)
                    if (agency) {
                        const { percentage, minimumFee } = agency.feeStructure
                        if (percentage) {
                            const fee = deal.totalCost * (percentage / 100)
                            agencyFee += minimumFee ? Math.max(fee, minimumFee) : fee
                        } else if (minimumFee) {
                            agencyFee += minimumFee
                        }
                    }
                }
            }

            console.log('Calculated metrics:', {
                postedInfluencers,
                totalViews,
                totalClicks,
                totalConversions,
                roi,
                cost,
                agencyFee
            })

            setCurrentMonthData({
                postedInfluencers,
                totalViews,
                totalClicks,
                totalConversions,
                roi: parseFloat(roi),
                cost,
                agencyFee
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setError('Failed to fetch dashboard data. Please try again later.')
            toast({
                title: "Error",
                description: "Failed to fetch dashboard data. Please try again later.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
    }

    if (!currentMonthData) {
        return <div className="flex justify-center items-center h-screen">No data available</div>
    }

    return (
        <motion.div
            className="container mx-auto p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <h2 className="text-2xl font-bold mb-4">Current Month Performance</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Posted Influencers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedValue value={currentMonthData.postedInfluencers} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedValue value={currentMonthData.totalViews} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedValue value={currentMonthData.totalClicks} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedValue value={currentMonthData.totalConversions} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ROI</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedValue value={currentMonthData.roi} />%
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                $<AnimatedValue value={currentMonthData.cost} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Agency Fee</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                $<AnimatedValue value={currentMonthData.agencyFee} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    )
}