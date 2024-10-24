import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const uploadDir = path.join(process.cwd(), 'uploads')

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
        uploadDir: uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
    })

    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err)
                res.status(500).json({ message: 'Error parsing form data' })
                return resolve()
            }

            const file = files.file as formidable.File
            if (!file || !file[0]) {
                res.status(400).json({ message: 'No file uploaded' })
                return resolve()
            }

            const filePath = file[0].filepath
            const fileName = file[0].originalFilename || 'uploaded_file.csv'
            const newPath = path.join(uploadDir, fileName)

            fs.renameSync(filePath, newPath)

            const results: any[] = []

            fs.createReadStream(newPath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    res.status(200).json({
                        message: 'File uploaded successfully',
                        data: results,
                        fileName: fileName
                    })
                    resolve()
                })
                .on('error', (error) => {
                    console.error('Error parsing CSV:', error)
                    res.status(500).json({ message: 'Error parsing CSV file' })
                    resolve()
                })
        })
    })
}