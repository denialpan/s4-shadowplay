import S3Client from '@/utils/S3Client';

const s3 = S3Client;

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { fileKey } = req.body;

        if (!fileKey) {
            return res.status(400).json({ error: 'File name is required' });
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey,
        };

        try {
            // Delete the file from S3
            await s3.deleteObject(params).promise();
            console.log(`File ${fileKey} deleted successfully from S3`);

            return res.status(200).json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error(`Error deleting file ${fileKey}:`, error);
            return res.status(500).json({ error: 'Error deleting file from S3' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}