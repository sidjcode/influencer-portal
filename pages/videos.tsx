import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

interface Video {
    id?: number;
    youtubeId: string;
    title: string;
    trackingUrl: string;
    videoLink: string;
    influencerId: number;
    influencerName?: string;
    dealId?: number | null;
    postDate: string;
    couponCode?: string | null;
    channelTitle?: string;
    channelId?: string;
    thumbnail?: string;
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
}

interface Influencer {
    id: number;
    channelName: string;
    channelYoutubeId: string;
}

interface Deal {
    id: number;
    name: string;
}

export default function Videos() {
    const [activeForm, setActiveForm] = useState<'add' | 'update'>('add')
    const [videos, setVideos] = useState<Video[]>([])
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
    const [formData, setFormData] = useState<Video>({
        youtubeId: '',
        title: '',
        trackingUrl: '',
        videoLink: '',
        influencerId: 0,
        postDate: '',
    })
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchVideos()
        fetchInfluencers()
        fetchDeals()
    }, [])

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos')
            const data = await response.json()
            setVideos(data)
        } catch (error) {
            console.error('Error fetching videos:', error)
            toast({
                title: "Error",
                description: "Failed to fetch videos. Please try again.",
                variant: "destructive",
            })
        }
    }

    const fetchInfluencers = async () => {
        try {
            const response = await fetch('/api/influencers')
            const data = await response.json()
            setInfluencers(data)
        } catch (error) {
            console.error('Error fetching influencers:', error)
            toast({
                title: "Error",
                description: "Failed to fetch influencers. Please try again.",
                variant: "destructive",
            })
        }
    }

    const fetchDeals = async () => {
        try {
            const response = await fetch('/api/deals')
            const data = await response.json()
            setDeals(data)
        } catch (error) {
            console.error('Error fetching deals:', error)
            toast({
                title: "Error",
                description: "Failed to fetch deals. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const fetchVideoDetails = async () => {
        setIsLoading(true)
        setError(null)
        const videoId = extractVideoId(formData.videoLink)
        if (!videoId) {
            setError('Invalid YouTube URL')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`/api/googledata?videoId=${videoId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch video details')
            }
            const data = await response.json()

            const matchedInfluencer = influencers.find(inf => inf.channelYoutubeId === data.channelId)

            setFormData(prev => ({
                ...prev,
                youtubeId: videoId,
                title: data.title,
                channelTitle: data.channelTitle,
                channelId: data.channelId,
                postDate: new Date(data.postDate).toISOString().split('T')[0],
                thumbnail: data.thumbnail,
                viewCount: data.viewCount,
                likeCount: data.likeCount,
                commentCount: data.commentCount,
                influencerId: matchedInfluencer ? matchedInfluencer.id : prev.influencerId,
                influencerName: matchedInfluencer ? matchedInfluencer.channelName : undefined
            }))

        } catch (error) {
            setError('Error fetching video details. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const url = activeForm === 'add' ? '/api/videos' : `/api/videos/${selectedVideo?.id}`
            const method = activeForm === 'add' ? 'POST' : 'PUT'
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Video ${activeForm === 'add' ? 'added' : 'updated'} successfully.`,
                })
                fetchVideos()
                setShowConfirmation(true)
            } else {
                throw new Error(`Failed to ${activeForm} video`)
            }
        } catch (error) {
            console.error(`Error ${activeForm}ing video:`, error)
            toast({
                title: "Error",
                description: `Failed to ${activeForm} video. Please try again.`,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleVideoSelect = (videoId: string) => {
        const video = videos.find(v => v.id === parseInt(videoId))
        if (video) {
            setSelectedVideo(video)
            setFormData(video)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto py-8"
        >
            <h1 className="text-3xl font-bold mb-8">Manage Videos</h1>
            <div className="mb-8 flex space-x-4">
                <Button
                    onClick={() => setActiveForm('add')}
                    variant={activeForm === 'add' ? 'default' : 'outline'}
                    className="w-40 transition-all duration-300 ease-in-out"
                >
                    Add Video
                </Button>
                <Button
                    onClick={() => setActiveForm('update')}
                    variant={activeForm === 'update' ? 'default' : 'outline'}
                    className="w-40 transition-all duration-300 ease-in-out"
                >
                    Update Video
                </Button>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeForm}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                {activeForm === 'add' ? 'Add New Video' : 'Update Video'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeForm === 'update' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="mb-6"
                                >
                                    <Label htmlFor="selectVideo" className="text-lg mb-2 block">
                                        Select Video to Update
                                    </Label>
                                    <Select onValueChange={handleVideoSelect}>
                                        <SelectTrigger id="selectVideo" className="w-full">
                                            <SelectValue placeholder="Select a video" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {videos.map((video) => (
                                                <SelectItem key={video.id} value={video.id?.toString() || '0'}>
                                                    {video.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="videoLink">Video Link</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="videoLink"
                                                name="videoLink"
                                                value={formData.videoLink}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isLoading}
                                            />
                                            <Button type="button" onClick={fetchVideoDetails} disabled={isLoading}>
                                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fetch'}
                                            </Button>
                                        </div>
                                    </motion.div>
                                    {formData.thumbnail && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="col-span-2"
                                        >
                                            <Image
                                                src={formData.thumbnail}
                                                alt={formData.title || 'Video thumbnail'}
                                                width={320}
                                                height={180}
                                                className="rounded-lg"
                                            />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.05 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="trackingUrl">Tracking URL</Label>
                                        <Input
                                            id="trackingUrl"
                                            name="trackingUrl"
                                            value={formData.trackingUrl}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.15 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="influencerId">Influencer</Label>
                                        <Select
                                            name="influencerId"
                                            value={formData.influencerId.toString()}
                                            onValueChange={(value) => handleInputChange({ target: { name: 'influencerId', value } } as React.ChangeEvent<HTMLSelectElement>)}
                                        >
                                            <SelectTrigger id="influencerId">
                                                <SelectValue placeholder="Select an influencer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {influencers.map((influencer) => (
                                                    <SelectItem key={influencer.id} value={influencer.id.toString()}>
                                                        {influencer.channelName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="dealId">Deal (Optional)</Label>
                                        <Select
                                            name="dealId"
                                            value={formData.dealId?.toString() || '0'}
                                            onValueChange={(value)   => handleInputChange({ target: { name: 'dealId', value } } as React.ChangeEvent<HTMLSelectElement>)}
                                        >
                                            <SelectTrigger id="dealId">
                                                <SelectValue placeholder="Select a deal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">No Deal</SelectItem>
                                                {deals.map((deal) => (
                                                    <SelectItem key={deal.id} value={deal.id.toString()}>
                                                        {deal.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.25 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="postDate">Post Date</Label>
                                        <Input
                                            id="postDate"
                                            name="postDate"
                                            type="date"
                                            value={formData.postDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                                        <Input
                                            id="couponCode"
                                            name="couponCode"
                                            value={formData.couponCode || ''}
                                            onChange={handleInputChange}
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.35 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="viewCount">View Count</Label>
                                        <Input
                                            id="viewCount"
                                            name="viewCount"
                                            value={formData.viewCount || ''}
                                            onChange={handleInputChange}
                                            readOnly
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="likeCount">Like Count</Label>
                                        <Input
                                            id="likeCount"
                                            name="likeCount"
                                            value={formData.likeCount || ''}
                                            onChange={handleInputChange}
                                            readOnly
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.45 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="commentCount">Comment Count</Label>
                                        <Input
                                            id="commentCount"
                                            name="commentCount"
                                            value={formData.commentCount || ''}
                                            onChange={handleInputChange}
                                            readOnly
                                        />
                                    </motion.div>
                                </div>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {activeForm === 'add' ? 'Add Video' : 'Update Video'}
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Video {activeForm === 'add' ? 'Added' : 'Updated'} Successfully</DialogTitle>
                        <DialogDescription>
                            The video has been {activeForm === 'add' ? 'added to' : 'updated in'} the database.
                        </DialogDescription>
                    </DialogHeader>
                    {formData && (
                        <div className="space-y-4">
                            {formData.thumbnail && (
                                <Image
                                    src={formData.thumbnail}
                                    alt={formData.title}
                                    width={320}
                                    height={180}
                                    className="w-full rounded-lg"
                                />
                            )}
                            <div className="space-y-2">
                                <p><strong>Title:</strong> {formData.title}</p>
                                <p><strong>Channel:</strong> {formData.channelTitle}</p>
                                <p><strong>Influencer:</strong> {formData.influencerName || 'Not matched'}</p>
                                <p><strong>Published:</strong> {formData.postDate}</p>
                                <p><strong>Views:</strong> {formData.viewCount || 'N/A'}</p>
                                <p><strong>Likes:</strong> {formData.likeCount || 'N/A'}</p>
                                <p><strong>Comments:</strong> {formData.commentCount || 'N/A'}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowConfirmation(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}