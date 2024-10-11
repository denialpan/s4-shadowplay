import AWS from 'aws-sdk';

// Configure AWS with your access and secret key.
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb'
        }
    }
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { file, name, type } = req.body; // assuming the file is being sent as a base64 encoded string

        // Create buffer from the base64 string
        const buffer = Buffer.from(file.replace(/^data:.*;base64,/, ""), 'base64');

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${Date.now()}-${name}`, // file name with timestamp
            Body: buffer,
            ContentType: type,
            ACL: 'public-read' // adjust this based on your needs
        };

        const options = { partSize: 5 * 1024 * 1024, queueSize: 10 };

        try {
            const data = await s3.upload(params, options).promise();
            res.status(200).json({ message: 'File uploaded successfully', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error uploading file' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
