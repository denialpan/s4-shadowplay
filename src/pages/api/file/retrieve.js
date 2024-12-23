import S3Client from "@/utils/S3Client";
import jwt from 'jsonwebtoken';
// import { parse } from 'cookie';

const JWT_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {

    const s3 = S3Client;

    if (req.method === 'GET') {

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
        };

        try {

            const data = await s3.listObjectsV2(params).promise();

            const files = data.Contents.map(file => ({
                Key: file.Key,
                LastModified: file.LastModified,
                Size: file.Size,
            }));

            res.status(200).json({ files });
        } catch (error) {
            console.error('Error fetching S3 files:', error);
            res.status(500).json({ error: 'Error fetching files from S3' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}