import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

interface Influencer {
    id?: number;
    channelName: string;
    channelYoutubeId: string;
    category: string;
    avgViews: number;
    engagementRate: number;
    topCountriesProportion: number;
    maleFollowers: number;
    followerGrowthRate: number;
    englishSpeakingFollowers: number;
    country: string;
    language: string;
}

const predefinedCategories = [
    "PRODUCTIVITY_AND_ORGANIZATION",
    "TECH_AND_SOFTWARE",
    "BUSINESS_AND_ENTREPRENEURSHIP",
    "LIFESTYLE_AND_VLOGS",
    "HEALTH_AND_WELLNESS",
    "EDUCATION_AND_CAREER",
    "ARTS_AND_CRAFTS",
    "FASHION_AND_BEAUTY",
    "TRAVEL_AND_CULTURE",
    "HOME_AND_DESIGN",
    "FINANCE_AND_INVESTING",
    "PHILOSOPHY_AND_PERSONAL_DEVELOPMENT",
    "ENTERTAINMENT_AND_MEDIA",
    "OTHER"
]

const topCountries = [
    "USA", "Canada", "Spain", "Philippines", "India",
    "Australia", "UK", "Germany", "France", "Brazil", "Other"
]

const languages = ["English", "Spanish", "Turkish", "Urdu", "Hindi", "Other"]

export default function Influencers() {
    const [activeForm, setActiveForm] = useState<'add' | 'update'>('add')
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
    const [formData, setFormData] = useState<Influencer>({
        channelName: '',
        channelYoutubeId: '',
        category: '',
        avgViews: 0,
        engagementRate: 0,
        topCountriesProportion: 0,
        maleFollowers: 0,
        followerGrowthRate: 0,
        englishSpeakingFollowers: 0,
        country: '',
        language: '',
    })
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [newCategory, setNewCategory] = useState('')
    const [otherCountry, setOtherCountry] = useState('')
    const [otherLanguage, setOtherLanguage] = useState('')

    useEffect(() => {
        fetchInfluencers()
    }, [])

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'category' ? value : Number(value) || value
        }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            category: value
        }))
        if (value !== "OTHER") {
            setNewCategory('')
        }
    }

    const handleCountryChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            country: value
        }))
        if (value !== "Other") {
            setOtherCountry('')
        }
    }

    const handleLanguageChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            language: value
        }))
        if (value !== "Other") {
            setOtherLanguage('')
        }
    }

    const handleNewCategorySubmit = () => {
        if (newCategory && formData.category === "OTHER") {
            setFormData(prev => ({
                ...prev,
                category: newCategory.toUpperCase()
            }))
            setNewCategory('')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const submissionData = {
            ...formData,
            country: formData.country === "Other" ? otherCountry : formData.country,
            language: formData.language === "Other" ? otherLanguage : formData.language,
        }
        try {
            const url = activeForm === 'add' ? '/api/influencers' : `/api/influencers/${selectedInfluencer?.id}`
            const method = activeForm === 'add' ? 'POST' : 'PUT'
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            })
            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Influencer ${activeForm === 'add' ? 'added' : 'updated'} successfully.`,
                })
                fetchInfluencers()
                if (activeForm === 'add') {
                    setShowConfirmation(true)
                    setTimeout(() => setShowConfirmation(false), 5000) // Hide after 5 seconds
                }
                setFormData({
                    channelName: '',
                    channelYoutubeId: '',
                    category: '',
                    avgViews: 0,
                    engagementRate: 0,
                    topCountriesProportion: 0,
                    maleFollowers: 0,
                    followerGrowthRate: 0,
                    englishSpeakingFollowers: 0,
                    country: '',
                    language: '',
                })
                setSelectedInfluencer(null)
                setNewCategory('')
                setOtherCountry('')
                setOtherLanguage('')
            } else {
                throw new Error(`Failed to ${activeForm} influencer`)
            }
        } catch (error) {
            console.error(`Error ${activeForm}ing influencer:`, error)
            toast({
                title: "Error",
                description: `Failed to ${activeForm} influencer. Please try again.`,
                variant: "destructive",
            })
        }
    }

    const handleInfluencerSelect = (influencerId: string) => {
        const influencer = influencers.find(inf => inf.id === parseInt(influencerId))
        if (influencer) {
            setSelectedInfluencer(influencer)
            setFormData(influencer)
            if (!topCountries.includes(influencer.country)) {
                setOtherCountry(influencer.country)
            }
            if (!languages.includes(influencer.language)) {
                setOtherLanguage(influencer.language)
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto py-8"
        >
            <h1 className="text-3xl font-bold mb-8">Manage Influencers</h1>
            <div className="mb-8 flex space-x-4">
                <Button
                    onClick={() => setActiveForm('add')}
                    variant={activeForm === 'add' ? 'default' : 'outline'}
                    className="w-40 transition-all duration-300 ease-in-out"
                >
                    Add Influencer
                </Button>
                <Button
                    onClick={() => setActiveForm('update')}
                    variant={activeForm === 'update' ? 'default' : 'outline'}
                    className="w-40 transition-all duration-300 ease-in-out"
                >
                    Update Influencer
                </Button>
            </div>
            <AnimatePresence mode="wait">
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4"
                    >
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>
                                Influencer has been successfully added.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
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
                                {activeForm === 'add' ? 'Add New Influencer' : 'Update Influencer'}
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
                                    <Label htmlFor="selectInfluencer" className="text-lg mb-2 block">
                                        Select Influencer to Update
                                    </Label>
                                    <Select onValueChange={handleInfluencerSelect}>
                                        <SelectTrigger id="selectInfluencer" className="w-full">
                                            <SelectValue placeholder="Select an influencer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {influencers.map((influencer) => (
                                                <SelectItem key={influencer.id} value={influencer.id?.toString() || ''}>
                                                    {influencer.channelName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(formData).map(([key, value], index) => (
                                        key !== 'id' && key !== 'category' && key !== 'country' && key !== 'language' && (
                                            <motion.div
                                                key={key}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor={key} className="text-sm font-medium">
                                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                </Label>
                                                <Input
                                                    id={key}
                                                    name={key}
                                                    type={typeof value === 'number' ? 'number' : 'text'}
                                                    value={value}
                                                    onChange={handleInputChange}
                                                    required
                                                    step={key.includes('Rate') || key.includes('Proportion') ? '0.01' : '1'}
                                                    className="w-full p-2 border rounded-md"
                                                />
                                            </motion.div>
                                        )
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.05 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="category" className="text-sm font-medium">
                                            Category
                                        </Label>
                                        <Select onValueChange={handleCategoryChange} value={formData.category}>
                                            <SelectTrigger id="category" className="w-full">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {predefinedCategories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category.replace(/_/g, ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    {formData.category === "OTHER" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="newCategory" className="text-sm font-medium">
                                                New Category
                                            </Label>
                                            <div className="flex space-x-2">
                                                <Input
                                                    id="newCategory"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    placeholder="Enter new category"
                                                    className="w-full p-2 border rounded-md"
                                                />
                                                <Button type="button" onClick={handleNewCategorySubmit}>
                                                    Add
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.15 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="country" className="text-sm font-medium">
                                            Country
                                        </Label>

                                        <Select onValueChange={handleCountryChange} value={formData.country}>
                                            <SelectTrigger id="country" className="w-full">
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {topCountries.map((country) => (
                                                    <SelectItem key={country} value={country}>
                                                        {country}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    {formData.country === "Other" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="otherCountry" className="text-sm font-medium">
                                                Other Country
                                            </Label>
                                            <Input
                                                id="otherCountry"
                                                value={otherCountry}
                                                onChange={(e) => setOtherCountry(e.target.value)}
                                                placeholder="Enter country name"
                                                className="w-full p-2 border rounded-md"
                                                required={formData.country === "Other"}
                                            />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.25 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="language" className="text-sm font-medium">
                                            Language
                                        </Label>
                                        <Select onValueChange={handleLanguageChange} value={formData.language}>
                                            <SelectTrigger id="language" className="w-full">
                                                <SelectValue placeholder="Select a language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {languages.map((lang) => (
                                                    <SelectItem key={lang} value={lang}>
                                                        {lang}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    {formData.language === "Other" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="otherLanguage" className="text-sm font-medium">
                                                Other Language
                                            </Label>
                                            <Input
                                                id="otherLanguage"
                                                value={otherLanguage}
                                                onChange={(e) => setOtherLanguage(e.target.value)}
                                                placeholder="Enter language name"
                                                className="w-full p-2 border rounded-md"
                                                required={formData.language === "Other"}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    <Button type="submit" className="w-full">
                                        {activeForm === 'add' ? 'Add Influencer' : 'Update Influencer'}
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