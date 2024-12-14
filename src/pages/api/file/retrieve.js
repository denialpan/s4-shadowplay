import S3Client from "@/utils/S3Client";
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { validateToken } from "@/utils/validateToken";

const JWT_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {

    const s3 = S3Client;

    if (req.method === 'GET') {

        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        const token = cookies.authToken;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized. No token provided.' });
        }

        const bucketName = process.env.AWS_S3_BUCKET;

        const params = {
            Bucket: bucketName,
        };

        try {

            const decoded = jwt.verify(token, JWT_KEY);
            req.user = decoded;
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