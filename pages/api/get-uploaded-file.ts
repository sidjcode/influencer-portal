import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { fileName } = req.query

    if (!fileName || typeof fileName !== 'string') {
        return res.status(400).json({ message: 'File name is required' })
    }

    const filePath = path.join(process.cwd(), 'uploads', fileName)

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' })
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    res.status(200).json({ content: fileContent })
}