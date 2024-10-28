"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, DollarSign, MousePointer, ShoppingCart, Percent, Video, ExternalLink, ArrowUpDown } from "lucide-react"
import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { toast } from "@/components/ui/use-toast"
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CurrentMonthData {
    postedVideos: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    roi: number;
    cost: number;
    agencyFee: number;
}

interface Video {
    id: number;
    youtubeId: string;
    title: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    clicks: number;
    conversions: number;
    cost: number;
    influencerId: number;
    postDate: string;
    thumbnail: string;
    influencer: {
        channelName: string;
    };
}

interface DailyPostData {
    date: string;
    videoCount: number;
    views: number;
}

const AnimatedValue: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2 }) => {
    const animatedValue = useCountUp(value, duration)
    return <>{animatedValue.toLocaleString()}</>
}

export default function Dashboard() {
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData | null>(null)
    const [allVideos, setAllVideos] = useState<Video[]>([])
    const [dailyPostData, setDailyPostData] = useState<DailyPostData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortColumn, setSortColumn] = useState<keyof Video>('postDate')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [activeChart, setActiveChart] = useState<'videoCount' | 'views'>('videoCount')

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

            // Calculate metrics
            const postedVideos = videos.length
            const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
            const totalClicks = videos.reduce((sum, video) => sum + (video.clicks || 0), 0)
            const totalConversions = videos.reduce((sum, video) => sum + (video.conversions || 0), 0)
            const cost = videos.reduce((sum, video) => sum + (video.cost || 0), 0)
            const roi = cost > 0 ? ((totalConversions * 150 / cost) * 100).toFixed(2) : '0'

            // Calculate daily post data
            const dailyData: { [key: string]: { count: number, views: number } } = {}
            for (let i = 1; i <= 31; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
                if (date > currentDate) break
                const dateString = date.toISOString().split('T')[0]
                dailyData[dateString] = { count: 0, views: 0 }
            }
            videos.forEach(video => {
                const date = new Date(video.postDate).toISOString().split('T')[0]
                if (dailyData[date]) {
                    dailyData[date].count++
                    dailyData[date].views += video.viewCount || 0
                }
            })
            const dailyPostData = Object.entries(dailyData).map(([date, data]) => ({
                date,
                videoCount: data.count,
                views: data.views
            })).sort((a, b) => a.date.localeCompare(b.date))

            setCurrentMonthData({
                postedVideos,
                totalViews,
                totalClicks,
                totalConversions,
                roi: parseFloat(roi),
                cost,
                agencyFee: 0 // You may want to calculate this separately
            })
            setAllVideos(videos)
            setDailyPostData(dailyPostData)
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

    const sortedVideos = useMemo(() => {
        return [...allVideos].sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
            if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [allVideos, sortColumn, sortDirection])

    const handleSort = (column: keyof Video) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
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

    // Calculate totals for the summary row
    const totalVideos = allVideos.length
    const totalViews = allVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
    const totalLikes = allVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0)
    const totalComments = allVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0)
    const totalClicks = allVideos.reduce((sum, video) => sum + (video.clicks || 0), 0)
    const totalConversions = allVideos.reduce((sum, video) => sum + (video.conversions || 0), 0)
    const totalCost = allVideos.reduce((sum, video) => sum + (video.cost || 0), 0)
    const netEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2) : '0.00'
    const totalCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00'
    const netROI = totalCost > 0 ? (((totalConversions * 150) / totalCost) * 100).toFixed(2) : '0.00'

    const chartConfig = {
        videoCount: {
            label: "Videos Posted",
            color: "hsl(262, 83%, 58%)", // Purple color
        },
        views: {
            label: "Views",
            color: "hsl(214, 82%, 51%)", // Blue color
        },
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Posted Videos</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedValue value={currentMonthData.postedVideos} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
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
            </div>

            <motion.div variants={itemVariants} className="mb-8">
                <Card>
                    <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                            <CardTitle>Daily Video Performance</CardTitle>
                            <CardDescription>
                                Showing videos posted and views for the current month
                            </CardDescription>
                        </div>
                        <div className="flex">
                            {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => (
                                <button
                                    key={key}
                                    data-active={activeChart === key}
                                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                    onClick={() => setActiveChart(key)}
                                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[key].label}
                  </span>
                                    <span className="text-lg font-bold leading-none sm:text-3xl">
                    {dailyPostData.reduce((acc, curr) => acc + curr[key], 0).toLocaleString()}
                  </span>
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="px-2  sm:p-6">
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyPostData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(value) => {
                                            const date = new Date(value)
                                            return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                className="w-[150px]"
                                                nameKey={activeChart}
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                }}
                                            />
                                        }
                                    />
                                    <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle>All Videos Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thumbnail</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('title')}>
                                            Title <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Influencer</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('viewCount')}>
                                            Views <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('likeCount')}>
                                            Likes <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('commentCount')}>
                                            Comments <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Engagement Rate</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('clicks')}>
                                            Clicks <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>CTR</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('conversions')}>
                                            Conversions <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('cost')}>
                                            Cost <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>ROI</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedVideos.map((video) => {
                                    const engagementRate = video.viewCount > 0
                                        ? ((video.likeCount + video.commentCount) / video.viewCount * 100).toFixed(2)
                                        : '0.00'
                                    const ctr = video.viewCount > 0
                                        ? ((video.clicks / video.viewCount) * 100).toFixed(2)
                                        : '0.00'
                                    const roi = video.cost > 0
                                        ? (((video.conversions * 150) / video.cost) * 100).toFixed(2)
                                        : '0.00'
                                    return (
                                        <TableRow key={video.id}>
                                            <TableCell>
                                                <Image
                                                    src={video.thumbnail || '/placeholder.svg'}
                                                    alt={video.title}
                                                    width={80}
                                                    height={45}
                                                    className="rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">{video.title}</TableCell>
                                            <TableCell>{video.influencer.channelName}</TableCell>
                                            <TableCell>{video.viewCount?.toLocaleString()}</TableCell>
                                            <TableCell>{video.likeCount?.toLocaleString()}</TableCell>
                                            <TableCell>{video.commentCount?.toLocaleString()}</TableCell>
                                            <TableCell>{engagementRate}%</TableCell>
                                            <TableCell>{video.clicks?.toLocaleString()}</TableCell>
                                            <TableCell>{ctr}%</TableCell>
                                            <TableCell>{video.conversions?.toLocaleString()}</TableCell>
                                            <TableCell>${video.cost?.toLocaleString()}</TableCell>
                                            <TableCell>{roi}%</TableCell>
                                            <TableCell>
                                                <Link href={`/videos/${video.id}`} className="flex items-center text-blue-500 hover:text-blue-700">
                                                    View <ExternalLink className="ml-1 h-4 w-4" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                <TableRow className="font-bold">
                                    <TableCell colSpan={2}>Total</TableCell>
                                    <TableCell>{totalVideos}</TableCell>
                                    <TableCell>{totalViews.toLocaleString()}</TableCell>
                                    <TableCell>{totalLikes.toLocaleString()}</TableCell>
                                    <TableCell>{totalComments.toLocaleString()}</TableCell>
                                    <TableCell>{netEngagementRate}%</TableCell>
                                    <TableCell>{totalClicks.toLocaleString()}</TableCell>
                                    <TableCell>{totalCTR}%</TableCell>
                                    <TableCell>{totalConversions.toLocaleString()}</TableCell>
                                    <TableCell>${totalCost.toLocaleString()}</TableCell>
                                    <TableCell>{netROI}%</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}