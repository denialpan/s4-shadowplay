import AWS from 'aws-sdk';
import multiparty from 'multiparty';
import fs from 'fs';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const config = {
    api: {
        bodyParser: false, // Disable bodyParser to handle file uploads
    },
};

let sseResponse = null; // Shared SSE connection

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error parsing form data' });
            }

            const fileUUIDs = fields.fileUUID;

            // Process each file
            await Promise.all(
                Object.keys(files).map(async (fileField, index) => {
                    const file = files[fileField][0];
                    const fileName = fields.name[index];
                    const fileUUID = fileUUIDs[index];
                    const fileStream = fs.createReadStream(file.path);

                    const params = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `uploads/folder/${fileName}`,
                        Body: fileStream,
                        ContentType: fields.type[index],
                        ACL: 'public-read',
                    };

                    const options = { partSize: 5 * 1024 * 1024, queueSize: 1 }; // Ensure chunked uploads for progress

                    const upload = s3.upload(params, options);

                    upload.on('httpUploadProgress', (progress) => {
                        const percentage = Math.round((progress.loaded / progress.total) * 100);
                        console.log(`Progress for ${fileName} (UUID: ${fileUUID}): ${percentage}%`);

                        // Send progress update through SSE
                        if (sseResponse) {
                            sseResponse.write(
                                `data: ${JSON.stringify({ fileUUID, fileName, progress: percentage })}\n\n`
                            );
                            // Flush to ensure immediate delivery
                            sseResponse.flush();
                        }
                    });

                    await upload.promise();
                })
            );

            res.status(200).json({ message: 'Files uploaded successfully!' });
        });
    } else if (req.method === 'GET') {

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        sseResponse = res;

        req.on('close', () => {
            console.log('SSE connection closed');
            sseResponse = null;
        });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
