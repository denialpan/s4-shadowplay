import AWS from 'aws-sdk';
import multiparty from 'multiparty';
import fs from 'fs';

// configure AWS with access and secret key.
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const config = {
    api: {
        bodyParser: false,
    }
};

let sseResponse;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error parsing form data' });
            }

            const file = files.file[0];
            const name = fields.name[0];
            const type = fields.type[0];

            // Stream the file instead of reading it into memory
            const fileStream = fs.createReadStream(file.path);

            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `uploads/${Date.now()}-${name}`,
                Body: fileStream, // Use the file stream here
                ContentType: type,
                ACL: 'public-read',
            };

            const options = { partSize: 5 * 1024 * 1024, queueSize: 10 };

            try {
                const upload = s3.upload(params, options);

                // console log upload progress on backend
                upload.on('httpUploadProgress', (progress) => {
                    const percentage = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`Progress: ${percentage}%`);

                    // sse progress to frontend
                    if (sseResponse) {
                        sseResponse.write(`data: ${percentage}\n\n`);
                        sseResponse.flush();
                    }
                });

                const data = await upload.promise();
                res.status(200).json({ message: 'File uploaded successfully', data });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error uploading file' });
            }
        });
    } else if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        console.log("BACKEND SSE connection established");

        sseResponse = res;

        // keep the connection alive
        const keepAliveInterval = setInterval(() => {
            if (sseResponse) {

                sseResponse.write(':heartbeat\n\n');
            }
        }, 30000);

        // stop heartbeat when connection closes
        req.on('close', () => {
            console.log("BACKEND CLOSED FOR REAL SSE connection closed");
            clearInterval(keepAliveInterval);
            sseResponse = null;
        });
    }
    else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
