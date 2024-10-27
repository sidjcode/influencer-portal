"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subMonths, subWeeks, eachMonthOfInterval, eachWeekOfInterval, startOfDay, endOfDay } from "date-fns"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from 'axios'

type TimeFrame = 'weekly' | 'monthly'
type MetricType = 'views' | 'clicks' | 'conversions' | 'posts'

const generateMockData = (startDate: Date, endDate: Date, timeFrame: TimeFrame) => {
    const data = []
    const interval = timeFrame === 'weekly' ? eachWeekOfInterval : eachMonthOfInterval
    const dates = interval({ start: startDate, end: endDate })

    dates.forEach((date) => {
        data.push({
            date: format(date, timeFrame === 'weekly' ? 'yyyy-MM-dd' : 'yyyy-MM'),
            views: Math.floor(Math.random() * 100000),
            clicks: Math.floor(Math.random() * 10000),
            conversions: Math.floor(Math.random() * 1000),
            posts: Math.floor(Math.random() * 50),
        })
    })
    return data
}

const MetricGraph = ({ title, description, metric, data, timeFrame }: {
    title: string
    description: string
    metric: MetricType
    data: any[]
    timeFrame: TimeFrame
}) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
            <ChartContainer
                config={{
                    [metric]: {
                        label: title,
                        color: "hsl(var(--chart-1))",
                    },
                }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), timeFrame === 'weekly' ? 'MMM dd' : 'MMM yyyy')}
                        />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey={metric} stroke={`var(--color-${metric})`} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
    </Card>
)

export default function Graphs() {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly')
    const [data, setData] = useState<any[]>([])
    const [dateRange, setDateRange] = useState<{
        from: Date
        to: Date | undefined
    }>({
        from: startOfDay(subMonths(new Date(), 6)),
        to: endOfDay(new Date()),
    })

    useEffect(() => {
        const fetchData = async () => {
            if (!dateRange.from || !dateRange.to) return

            // In a real application, you would fetch data from your API here
            // For now, we'll use the mock data generator
            const newData = generateMockData(dateRange.from, dateRange.to, timeFrame)
            setData(newData)
        }

        fetchData()
    }, [timeFrame, dateRange])

    const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
        if (range.from && range.to) {
            setDateRange({
                from: startOfDay(range.from),
                to: endOfDay(range.to),
            })
        }
    }

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Graphs</h1>
                <div className="flex items-center space-x-4">
                    <Select value={timeFrame} onValueChange={(value: TimeFrame) => setTimeFrame(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time frame" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <MetricGraph
                    title="Views"
                    description={`${timeFrame === 'weekly' ? 'Weekly' : 'Monthly'} view count`}
                    metric="views"
                    data={data}
                    timeFrame={timeFrame}
                />
                <MetricGraph
                    title="Clicks"
                    description={`${timeFrame === 'weekly' ? 'Weekly' : 'Monthly'} click count`}
                    metric="clicks"
                    data={data}
                    timeFrame={timeFrame}
                />
                <MetricGraph
                    title="Conversions"
                    description={`${timeFrame === 'weekly' ? 'Weekly' : 'Monthly'} conversion count`}
                    metric="conversions"
                    data={data}
                    timeFrame={timeFrame}
                />
                <MetricGraph
                    title="Influencer Posts"
                    description={`${timeFrame === 'weekly' ? 'Weekly' : 'Monthly'} post count`}
                    metric="posts"
                    data={data}
                    timeFrame={timeFrame}
                />
            </div>
        </div>
    )
}