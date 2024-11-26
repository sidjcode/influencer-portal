"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, DollarSign, MousePointer, ShoppingCart, Percent, Video, ExternalLink, ArrowUpDown, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
    const [updatingVideoId, setUpdatingVideoId] = useState<number | null>(null)
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { toast } = useToast()

    const fetchDashboardData = useCallback(async (selectedMonth: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const [year, month] = selectedMonth.split('-').map(Number);
            const firstDayOfMonth = new Date(year, month - 1, 1);
            const lastDayOfMonth = new Date(year, month, 0);

            const videosResponse = await fetch(`/api/videos?startDate=${firstDayOfMonth.toISOString()}&endDate=${lastDayOfMonth.toISOString()}`)
            if (!videosResponse.ok) {
                throw new Error(`HTTP error! status: ${videosResponse.status}`)
            }
            const videos: Video[] = await videosResponse.json()

            const filteredVideos = videos.filter(video => {
                const videoDate = new Date(video.postDate)
                return videoDate >= firstDayOfMonth && videoDate <= lastDayOfMonth
            })

            const postedVideos = filteredVideos.length
            const totalViews = filteredVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
            const totalClicks = filteredVideos.reduce((sum, video) => sum + (video.clicks || 0), 0)
            const totalConversions = Math.round(totalClicks * 0.075) // 7.5% of clicks convert
            const cost = filteredVideos.reduce((sum, video) => sum + (video.cost || 0), 0)
            const roi = cost > 0 ? ((totalConversions * 120 / cost) * 100).toFixed(2) : '0'

            const dailyData: { [key: string]: { count: number, views: number } } = {}
            for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
                const date = new Date(year, month - 1, i)
                const dateString = date.toISOString().split('T')[0]
                dailyData[dateString] = { count: 0, views: 0 }
            }
            filteredVideos.forEach(video => {
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
                agencyFee: 0
            })
            setAllVideos(filteredVideos)
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
    }, [toast])

    useEffect(() => {
        fetchDashboardData(selectedMonth)
    }, [selectedMonth, fetchDashboardData])

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

    const handleUpdateVideo = async (videoId: number) => {
        setUpdatingVideoId(videoId)
        setIsUpdateDialogOpen(true)
        try {
            const response = await fetch(`/api/updateclicks?id=${videoId}`, { method: 'POST' })
            if (!response.ok) {
                throw new Error('Failed to update video data')
            }
            const updatedVideo: Video = await response.json()
            setAllVideos(prevVideos => prevVideos.map(video => video.id === updatedVideo.id ? updatedVideo : video))
            toast({
                title: "Video Updated",
                description: "The video data has been successfully updated.",
            })
        } catch (error) {
            console.error('Error updating video:', error)
            toast({
                title: "Update Failed",
                description: "Failed to update the video data. Please try again.",
                variant: "destructive",
            })
        } finally {
            setUpdatingVideoId(null)
            setIsUpdateDialogOpen(false)
        }
    }

    const handleRefreshNumbers = async () => {
        setIsRefreshing(true);
        try {
            const updatedVideos = await Promise.all(allVideos.map(async (video) => {
                const response = await fetch(`/api/googledata?videoId=${video.youtubeId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for video ${video.youtubeId}`);
                }
                return await response.json();
            }));

            const updateResponse = await fetch('/api/updateVideoMetrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videos: updatedVideos }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update video metrics in the database');
            }

            const updatedVideosFromDB = await updateResponse.json();

            setAllVideos(updatedVideosFromDB);

            // Recalculate dailyPostData
            const newDailyData: { [key: string]: { count: number, views: number } } = {};
            updatedVideosFromDB.forEach((video: Video) => {
                const date = new Date(video.postDate).toISOString().split('T')[0];
                if (!newDailyData[date]) {
                    newDailyData[date] = { count: 0, views: 0 };
                }
                newDailyData[date].count++;
                newDailyData[date].views += video.viewCount || 0;
            });

            const newDailyPostData = Object.entries(newDailyData).map(([date, data]) => ({
                date,
                videoCount: data.count,
                views: data.views
            })).sort((a, b) => a.date.localeCompare(b.date));

            setDailyPostData(newDailyPostData);

            // Update currentMonthData
            const totalViews = updatedVideosFromDB.reduce((sum: number, video: Video) => sum + (video.viewCount || 0), 0);
            const totalClicks = updatedVideosFromDB.reduce((sum: number, video: Video) => sum + (video.clicks || 0), 0);
            const totalConversions = Math.round(totalClicks * 0.075);
            const cost = updatedVideosFromDB.reduce((sum: number, video: Video) => sum + (video.cost || 0), 0);
            const roi = cost > 0 ? ((totalConversions * 120 / cost) * 100).toFixed(2) : '0';

            setCurrentMonthData(prevData => ({
                ...prevData!,
                totalViews,
                totalClicks,
                totalConversions,
                roi: parseFloat(roi),
                cost,
            }));

            toast({
                title: "Metrics Updated",
                description: "Video metrics have been successfully refreshed from YouTube and updated in the database.",
            });
        } catch (error) {
            console.error('Error refreshing numbers:', error);
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh the video metrics. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
    }

    if (!currentMonthData) {
        return <div className="flex justify-center items-center h-screen">No data available</div>
    }

    const totalVideos = allVideos.length
    const totalViews = allVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
    const totalLikes = allVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0)
    const totalComments = allVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0)
    const totalClicks = allVideos.reduce((sum, video) => sum + (video.clicks || 0), 0)
    const totalConversions = Math.round(totalClicks * 0.075)
    const totalCost = allVideos.reduce((sum, video) => sum + (video.cost || 0), 0)
    const netEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2) : '0.00'
    const totalCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00'
    const netROI = totalCost > 0 ? (((totalConversions * 120) / totalCost) * 100).toFixed(2) : '0.00'

    const chartConfig = {
        videoCount: {
            label: "Videos Posted",
            color: "hsl(262, 83%, 58%)",
        },
        views: {
            label: "Views",
            color: "hsl(214, 82%, 51%)",
        },
    }

    return (
        <motion.div
            className="container mx-auto p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button
                    onClick={handleRefreshNumbers}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Metrics
                        </>
                    )}
                </Button>
            </div>
            <div className="mb-6">
                <Label htmlFor="month-select" className="text-lg font-semibold mb-2 block">
                    Select Month
                </Label>
                <Select
                    value={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                >
                    <SelectTrigger id="month-select" className="w-[200px]">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                            const date = new Date(new Date().getFullYear(), i, 1)
                            return (
                                <SelectItem key={i} value={date.toISOString().slice(0, 7)}>
                                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>
            <h2 className="text-2xl font-bold mb-4">
                Performance for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
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
                                Showing videos posted and views for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
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
                    <CardContent className="px-2 sm:p-6">
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
                                    const conversions = Math.round(video.clicks * 0.075)
                                    const engagementRate = video.viewCount > 0
                                        ? ((video.likeCount + video.commentCount) / video.viewCount * 100).toFixed(2)
                                        : '0.00'
                                    const ctr = video.viewCount > 0
                                        ? ((video.clicks / video.viewCount) * 100).toFixed(2)
                                        : '0.00'
                                    const roi = video.cost > 0
                                        ? (((conversions * 120) / video.cost) * 100).toFixed(2)
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
                                            <TableCell>{video.influencer?.channelName || 'N/A'}</TableCell>
                                            <TableCell>{video.viewCount?.toLocaleString()}</TableCell>
                                            <TableCell>{video.likeCount?.toLocaleString()}</TableCell>
                                            <TableCell>{video.commentCount?.toLocaleString()}</TableCell>
                                            <TableCell>{engagementRate}%</TableCell>
                                            <TableCell>{video.clicks?.toLocaleString()}</TableCell>
                                            <TableCell>{ctr}%</TableCell>
                                            <TableCell>{conversions?.toLocaleString()}</TableCell>
                                            <TableCell>${video.cost?.toLocaleString()}</TableCell>
                                            <TableCell>{roi}%</TableCell>
                                            <TableCell>
                                                <a
                                                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-500 hover:text-blue-700"
                                                >
                                                    View <ExternalLink className="ml-1 h-4 w-4"/>
                                                </a>
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
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Updating Video Data</DialogTitle>
                        <DialogDescription>
                            We're fetching the latest data from YouTube and Bitly. This may take a moment.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}