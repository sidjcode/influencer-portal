import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DealFormProps {
    onSubmit: (data: any) => void
    initialData?: any
}

export function DealForm({ onSubmit, initialData = {} }: DealFormProps) {
    const [formData, setFormData] = useState({
        contractedBy: initialData.contractedBy || 'DIRECT',
        agencyName: initialData.agencyName || '',
        pricingType: initialData.pricingType || 'FIXED',
        fixedCost: initialData.fixedCost || '',
        cpm: initialData.cpm || '',
        priceCeiling: initialData.priceCeiling || '',
        viewGuarantee: initialData.viewGuarantee || '',
        viewGuaranteeDays: initialData.viewGuaranteeDays || '',
        postDate: initialData.postDate ? new Date(initialData.postDate).toISOString().split('T')[0] : '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Deal</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="contractedBy">Contracted By</Label>
                        <Select
                            value={formData.contractedBy}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, contractedBy: value }))}
                        >
                            <SelectTrigger id="contractedBy">
                                <SelectValue placeholder="Select who contracted the deal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DIRECT">Direct</SelectItem>
                                <SelectItem value="AGENCY">Agency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.contractedBy === 'AGENCY' && (
                        <div className="space-y-2">
                            <Label htmlFor="agencyName">Agency Name</Label>
                            <Input
                                type="text"
                                id="agencyName"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="pricingType">Pricing Type</Label>
                        <Select
                            value={formData.pricingType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, pricingType: value }))}
                        >
                            <SelectTrigger id="pricingType">
                                <SelectValue placeholder="Select pricing type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FIXED">Fixed Cost</SelectItem>
                                <SelectItem value="CPM">CPM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.pricingType === 'FIXED' ? (
                        <div className="space-y-2">
                            <Label htmlFor="fixedCost">Fixed Cost</Label>
                            <Input
                                type="number"
                                id="fixedCost"
                                name="fixedCost"
                                value={formData.fixedCost}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="cpm">CPM</Label>
                                <Input
                                    type="number"
                                    id="cpm"
                                    name="cpm"
                                    value={formData.cpm}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceCeiling">Price Ceiling</Label>
                                <Input
                                    type="number"
                                    id="priceCeiling"
                                    name="priceCeiling"
                                    value={formData.priceCeiling}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="viewGuarantee">View Guarantee</Label>
                        <Input
                            type="number"
                            id="viewGuarantee"
                            name="viewGuarantee"
                            value={formData.viewGuarantee}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="viewGuaranteeDays">View Guarantee Days</Label>
                        <Input
                            type="number"
                            id="viewGuaranteeDays"
                            name="viewGuaranteeDays"
                            value={formData.viewGuaranteeDays}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postDate">Post Date</Label>
                        <Input
                            type="date"
                            id="postDate"
                            name="postDate"
                            value={formData.postDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Button type="submit">Submit Deal</Button>
                </form>
            </CardContent>
        </Card>
    )
}