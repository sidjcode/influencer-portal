import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, DollarSign, MousePointer, ShoppingCart, Percent, Video, ExternalLink } from "lucide-react"
import { motion } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { toast } from "@/components/ui/use-toast"
import Image from 'next/image'

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
    dayOfWeek: string;
    videoCount: number;
}

const AnimatedValue: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2 }) => {
    const animatedValue = useCountUp(value, duration)
    return <>{animatedValue.toLocaleString()}</>
}

export default function Reports() {
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData | null>(null)
    const [allVideos, setAllVideos] = useState<Video[]>([])
    const [dailyPostData, setDailyPostData] = useState<DailyPostData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchReportData()
    }, [])

    const fetchReportData = async () => {
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
            const totalConversions = Math.round(totalClicks * 0.075) // 7.5% of clicks
            const cost = videos.reduce((sum, video) => sum + (video.cost || 0), 0)
            const roi = cost > 0 ? ((totalConversions * 150 / cost) * 100).toFixed(2) : '0'

            // Calculate daily post data
            const dailyData: { [key: string]: { count: number, dayOfWeek: string } } = {}
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            for (let i = 1; i <= 31; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
                if (date > currentDate) break
                const dateString = date.toISOString().split('T')[0]
                dailyData[dateString] = { count: 0, dayOfWeek: daysOfWeek[date.getDay()] }
            }
            videos.forEach(video => {
                const date = new Date(video.postDate).toISOString().split('T')[0]
                if (dailyData[date]) {
                    dailyData[date].count++
                }
            })
            const dailyPostData = Object.entries(dailyData).map(([date, data]) => ({
                date,
                dayOfWeek: data.dayOfWeek,
                videoCount: data.count
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
            console.error('Error fetching report data:', error)
            setError('Failed to fetch report data. Please try again later.')
            toast({
                title: "Error",
                description: "Failed to fetch report data. Please try again later.",
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

    // Calculate totals for the summary row
    const totalVideos = allVideos.length
    const totalViews = allVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
    const totalLikes = allVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0)
    const totalComments = allVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0)
    const totalClicks = allVideos.reduce((sum, video) => sum + (video.clicks || 0), 0)
    const totalCost = allVideos.reduce((sum, video) => sum + (video.cost || 0), 0)
    const netEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2) : '0.00'
    const totalCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00'
    const netROI = totalCost > 0 ? (((totalClicks * 0.075 * 150) / totalCost) * 100).toFixed(2) : '0.00'

    return (
        <motion.div
            className="container mx-auto p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <h1 className="text-3xl font-bold mb-6">Detailed Reports</h1>
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
                    <CardHeader>
                        <CardTitle>Daily Video Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyPostData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="dayOfWeek"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value, index) => `${value} ${dailyPostData[index].date.split('-')[2]}`}
                                />
                                <YAxis
                                    tickFormatter={(value) => Math.floor(value)}
                                />
                                <Tooltip />
                                <Bar dataKey="videoCount" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
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
                                    <TableHead>Title</TableHead>
                                    <TableHead>Influencer</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Likes</TableHead>
                                    <TableHead>Comments</TableHead>
                                    <TableHead>Engagement Rate</TableHead>
                                    <TableHead>Clicks</TableHead>
                                    <TableHead>CTR</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>ROI</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allVideos.map((video) => {
                                    const engagementRate = video.viewCount > 0
                                        ? ((video.likeCount + video.commentCount) / video.viewCount * 100).toFixed(2)
                                        : '0.00'
                                    const ctr = video.viewCount > 0
                                        ? ((video.clicks / video.viewCount) * 100).toFixed(2)
                                        : '0.00'
                                    const roi = video.cost > 0
                                        ? (((video.clicks * 0.075 * 150) / video.cost) * 100).toFixed(2)
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
                                            <TableCell className="max-w-xs  truncate">{video.title}</TableCell>
                                            <TableCell>{video.influencer.channelName}</TableCell>
                                            <TableCell>{video.viewCount?.toLocaleString()}</TableCell>
                                            <TableCell>{video.likeCount?.toLocaleString()}</TableCell>
                                            <TableCell>{video.commentCount?.toLocaleString()}</TableCell>
                                            <TableCell>{engagementRate}%</TableCell>
                                            <TableCell>{video.clicks?.toLocaleString()}</TableCell>
                                            <TableCell>{ctr}%</TableCell>
                                            <TableCell>${video.cost?.toLocaleString()}</TableCell>
                                            <TableCell>{roi}%</TableCell>
                                            <TableCell>
                                                <a
                                                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-500 hover:text-blue-700"
                                                >
                                                    View <ExternalLink className="ml-1 h-4 w-4" />
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