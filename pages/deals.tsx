import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Deal {
    id?: number;
    name: string;
    influencerId: number;
    agencyId?: number | null;
    contractedBy: 'DIRECT' | 'AGENCY';
    pricingType: string;
    fixedCost?: number | null;
    cpm?: number | null;
    priceCeiling?: number | null;
    viewGuarantee?: number | null;
    viewGuaranteeDays?: number | null;
    status: string;
    numberOfVideos: number;
    uploadMonths: string[];
}

interface Influencer {
    id: number;
    channelName: string;
}

interface Agency {
    id: number;
    name: string;
}

export default function Deals() {
    const [activeForm, setActiveForm] = useState<'add' | 'update'>('add')
    const [deals, setDeals] = useState<Deal[]>([])
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [agencies, setAgencies] = useState<Agency[]>([])
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
    const [formData, setFormData] = useState<Deal>({
        name: '',
        influencerId: 0,
        contractedBy: 'DIRECT',
        pricingType: '',
        status: 'active',
        numberOfVideos: 1,
        uploadMonths: [''],
    })

    useEffect(() => {
        fetchDeals()
        fetchInfluencers()
        fetchAgencies()
    }, [])

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

    const fetchAgencies = async () => {
        try {
            const response = await fetch('/api/agencies')
            const data = await response.json()
            setAgencies(data)
        } catch (error) {
            console.error('Error fetching agencies:', error)
            toast({
                title: "Error",
                description: "Failed to fetch agencies. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: ['fixedCost', 'cpm', 'priceCeiling', 'viewGuarantee', 'viewGuaranteeDays', 'numberOfVideos'].includes(name) ? Number(value) : value
        }))

        if (name === 'influencerId' || name === 'numberOfVideos' || name === 'uploadMonths') {
            updateDealName()
        }
    }

    const handleUploadMonthChange = (index: number, value: string) => {
        const newUploadMonths = [...formData.uploadMonths]
        newUploadMonths[index] = value
        setFormData(prev => ({ ...prev, uploadMonths: newUploadMonths }))
        updateDealName()
    }

    const handleNumberOfVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numberOfVideos = Number(e.target.value)
        setFormData(prev => ({
            ...prev,
            numberOfVideos,
            uploadMonths: Array(numberOfVideos).fill('').map((_, i) => prev.uploadMonths[i] || '')
        }))
        updateDealName()
    }

    const updateDealName = () => {
        const influencer = influencers.find(inf => inf.id === Number(formData.influencerId))
        if (influencer && formData.uploadMonths[0]) {
            const startMonth = new Date(formData.uploadMonths[0]).toLocaleString('default', { month: 'long', year: 'numeric' })
            const newName = `${influencer.channelName}: ${formData.numberOfVideos} videos, Starting ${startMonth}`
            setFormData(prev => ({ ...prev, name: newName }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = activeForm === 'add' ? '/api/deals' : `/api/deals/${selectedDeal?.id}`
            const method = activeForm === 'add' ? 'POST' : 'PUT'
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Deal ${activeForm === 'add' ? 'added' : 'updated'} successfully.`,
                })
                fetchDeals()
                setFormData({
                    name: '',
                    influencerId: 0,
                    contractedBy: 'DIRECT',
                    pricingType: '',
                    status: 'active',
                    numberOfVideos: 1,
                    uploadMonths: [''],
                })
                setSelectedDeal(null)
            } else {
                throw new Error(`Failed to ${activeForm} deal`)
            }
        } catch (error) {
            console.error(`Error ${activeForm}ing deal:`, error)
            toast({
                title: "Error",
                description: `Failed to ${activeForm} deal. Please try again.`,
                variant: "destructive",
            })
        }
    }

    const handleDealSelect = (dealId: string) => {
        const deal = deals.find(d => d.id === parseInt(dealId))
        if (deal) {
            setSelectedDeal(deal)
            setFormData(deal)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto py-8"
        >
            <h1 className="text-3xl font-bold mb-8">Manage Deals</h1>
            <div className="mb-8 flex space-x-4">
                <Button
                    onClick={() => setActiveForm('add')}
                    variant={activeForm === 'add' ? 'default' : 'outline'}
                    className="w-40 transition-all duration-300 ease-in-out"
                >
                    Add Deal
                </Button>
                <Button
                    onClick={() => setActiveForm('update')}
                    variant={activeForm === 'update' ? 'default' : 'outline'}
                    className="w-40 transition-all duration-300 ease-in-out"
                >
                    Update Deal
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
                                {activeForm === 'add' ? 'Add New Deal' : 'Update Deal'}
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
                                    <Label htmlFor="selectDeal" className="text-lg mb-2 block">
                                        Select Deal to Update
                                    </Label>
                                    <Select onValueChange={handleDealSelect}>
                                        <SelectTrigger id="selectDeal" className="w-full">
                                            <SelectValue placeholder="Select a deal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {deals.map((deal) => (
                                                <SelectItem key={deal.id} value={deal.id?.toString() || ''}>
                                                    {deal.name}
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
                                        <Label htmlFor="influencerId">Influencer</Label>
                                        <Select name="influencerId" onValueChange={(value) => handleInputChange({ target: { name: 'influencerId', value } } as React.ChangeEvent<HTMLSelectElement>)}>
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
                                        transition={{ duration: 0.3, delay: 0.05 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="contractedBy">Contracted By</Label>
                                        <Select name="contractedBy" onValueChange={(value) => handleInputChange({ target: { name: 'contractedBy', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                                            <SelectTrigger id="contractedBy">
                                                <SelectValue placeholder="Select contracted by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DIRECT">Direct</SelectItem>
                                                <SelectItem value="AGENCY">Agency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    {formData.contractedBy === 'AGENCY' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="agencyId">Agency</Label>
                                            <Select name="agencyId" onValueChange={(value) => handleInputChange({ target: { name: 'agencyId', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                                                <SelectTrigger id="agencyId">
                                                    <SelectValue placeholder="Select an agency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {agencies.map((agency) => (
                                                        <SelectItem key={agency.id} value={agency.id.toString()}>
                                                            {agency.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.15 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="pricingType">Pricing Type</Label>
                                        <Select name="pricingType" onValueChange={(value) => handleInputChange({ target: { name: 'pricingType', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                                            <SelectTrigger id="pricingType">
                                                <SelectValue placeholder="Select pricing type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIXED">Fixed</SelectItem>
                                                <SelectItem value="CPM">CPM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    {formData.pricingType === 'FIXED' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="fixedCost">Fixed Cost (per video)</Label>
                                            <Input
                                                id="fixedCost"
                                                name="fixedCost"
                                                type="number"
                                                value={formData.fixedCost || ''}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </motion.div>
                                    )}
                                    {formData.pricingType === 'CPM' && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration:  0.3, delay: 0.2 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor="cpm">CPM</Label>
                                                <Input
                                                    id="cpm"
                                                    name="cpm"
                                                    type="number"
                                                    value={formData.cpm || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: 0.25 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor="priceCeiling">Price Ceiling</Label>
                                                <Input
                                                    id="priceCeiling"
                                                    name="priceCeiling"
                                                    type="number"
                                                    value={formData.priceCeiling || ''}
                                                    onChange={handleInputChange}
                                                />
                                            </motion.div>
                                        </>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="viewGuarantee">View Guarantee</Label>
                                        <Input
                                            id="viewGuarantee"
                                            name="viewGuarantee"
                                            type="number"
                                            value={formData.viewGuarantee || ''}
                                            onChange={handleInputChange}
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.35 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="viewGuaranteeDays">View Guarantee Days</Label>
                                        <Input
                                            id="viewGuaranteeDays"
                                            name="viewGuaranteeDays"
                                            type="number"
                                            value={formData.viewGuaranteeDays || ''}
                                            onChange={handleInputChange}
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="status">Status</Label>
                                        <Select name="status" onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.45 }}
                                        className="space-y-2 col-span-2"
                                    >
                                        <Label>Number of Videos and Upload Months</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Input
                                                    id="numberOfVideos"
                                                    name="numberOfVideos"
                                                    type="number"
                                                    value={formData.numberOfVideos}
                                                    onChange={handleNumberOfVideosChange}
                                                    required
                                                    min={1}
                                                    placeholder="Number of Videos"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                {formData.uploadMonths.map((month, index) => (
                                                    <Input
                                                        key={index}
                                                        type="month"
                                                        value={month}
                                                        onChange={(e) => handleUploadMonthChange(index, e.target.value)}
                                                        required
                                                        placeholder={`Upload Month ${index + 1}`}
                                                        className="mb-2"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    <Button type="submit" className="w-full">
                                        {activeForm === 'add' ? 'Add Deal' : 'Update Deal'}
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}