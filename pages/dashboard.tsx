import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, DollarSign, MousePointer, ShoppingCart, Percent } from "lucide-react"
import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'

interface CurrentMonthData {
    postedInfluencers: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    roi: number;
    cost: number;
    agencyFee: number;
}

const AnimatedValue: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2 }) => {
    const animatedValue = useCountUp(value, duration)
    return <>{animatedValue.toLocaleString()}</>
}

export default function Dashboard() {
    const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData | null>(null)

    useEffect(() => {
        // Simulating API call
        setTimeout(() => {
            setCurrentMonthData({
                postedInfluencers: 15,
                totalViews: 1000000,
                totalClicks: 50000,
                totalConversions: 5000,
                roi: 250,
                cost: 100000,
                agencyFee: 10000
            })
        }, 500)
    }, [])

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

    if (!currentMonthData) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
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