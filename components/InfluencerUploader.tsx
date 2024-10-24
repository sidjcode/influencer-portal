import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface InfluencerUploaderProps {
    onUploadSuccess: () => Promise<void>;
}

export function InfluencerUploader({ onUploadSuccess }: InfluencerUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
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

        setIsUploading(true)
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
            await onUploadSuccess()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload influencer dataset",
                variant: "destructive",
            })
            console.error('Error uploading influencer dataset:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleViewFile = async () => {
        if (!uploadedFileName) return

        try {
            const response = await axios.get(`/api/get-uploaded-file?fileName=${uploadedFileName}`)
            console.log(response.data.content)
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
        <Card>
            <CardHeader>
                <CardTitle>Upload Influencer Dataset</CardTitle>
                <CardDescription>Upload a CSV file containing influencer data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="influencer-file">CSV File</Label>
                        <Input
                            id="influencer-file"
                            type="file"
                            onChange={handleFileChange}
                            accept=".csv"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleUpload} disabled={!file || isUploading}>
                            {isUploading ? (
                                <>
                                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Influencers
                                </>
                            )}
                        </Button>
                        {uploadedFileName && (
                            <Button variant="outline" onClick={handleViewFile}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Uploaded File
                            </Button>
                        )}
                    </div>
                    {file && (
                        <p className="text-sm text-muted-foreground">
                            Selected file: {file.name}
                        </p>
                    )}
                    {!file && (
                        <p className="flex items-center text-sm text-muted-foreground">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            No file selected
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}