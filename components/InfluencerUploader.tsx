import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import axios from 'axios'

export function InfluencerUploader() {
    const [file, setFile] = useState<File | null>(null)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file to upload",
                variant: "destructive",
            })
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await axios.post('/api/upload-influencers', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            toast({
                title: "Success",
                description: "Influencer dataset uploaded successfully",
            })
            setUploadedFileName(response.data.fileName)
            console.log(response.data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload influencer dataset",
                variant: "destructive",
            })
            console.error('Error uploading influencer dataset:', error)
        }
    }

    const handleViewFile = async () => {
        if (!uploadedFileName) return

        try {
            const response = await axios.get(`/api/get-uploaded-file?fileName=${uploadedFileName}`)
            console.log(response.data.content)
            // You could display this content in a modal or a new page
            toast({
                title: "Success",
                description: "File content logged to console",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to retrieve file content",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Input type="file" onChange={handleFileChange} accept=".csv" />
                <Button onClick={handleUpload}>Upload Influencers</Button>
            </div>
            {uploadedFileName && (
                <Button onClick={handleViewFile}>View Uploaded File</Button>
            )}
        </div>
    )
}