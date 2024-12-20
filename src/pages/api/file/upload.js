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

const uploadMetadata = {};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(500).json({ error: 'Error parsing form data' });
            }

            const fileUUID = fields.fileUUID[0];
            const chunkIndex = parseInt(fields.chunkIndex[0], 10);
            const totalChunks = parseInt(fields.totalChunks[0], 10);
            const fileName = fields.name[0];
            const fileType = fields.type[0];

            if (!uploadMetadata[fileUUID]) {
                const { UploadId } = await s3
                    .createMultipartUpload({
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `uploads/${fileName}`,
                        ContentType: fileType,
                        ACL: 'public-read',
                    })
                    .promise();

                uploadMetadata[fileUUID] = {
                    uploadId: UploadId,
                    parts: [],
                    totalChunks,
                };
            }



            const { uploadId, parts } = uploadMetadata[fileUUID];
            const chunk = files.file[0];
            const partNumber = chunkIndex + 1;

            const chunkStream = fs.createReadStream(chunk.path);

            try {
                const { ETag } = await s3
                    .uploadPart({
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `uploads/${fileName}`,
                        PartNumber: partNumber,
                        UploadId: uploadId,
                        Body: chunkStream,
                    })
                    .promise();

                parts.push({ PartNumber: partNumber, ETag });

                fs.unlinkSync(chunk.path);

                console.log(`Uploaded part ${partNumber}/${totalChunks} for file ${fileName}`);

                if (parts.length === totalChunks) {
                    console.log(`Completing multipart upload for ${fileName}`);
                    await s3
                        .completeMultipartUpload({
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: `uploads/${fileName}`,
                            UploadId: uploadId,
                            MultipartUpload: { Parts: parts },
                        })
                        .promise();

                    delete uploadMetadata[fileUUID];
                    return res.status(200).json({ message: 'File uploaded successfully!' });
                }

                return res.status(200).json({ message: `Chunk ${chunkIndex + 1} received.` });
            } catch (error) {
                console.error(`Error uploading part ${partNumber}:`, error);

                await s3.abortMultipartUpload({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `uploads/${fileName}`,
                    UploadId: uploadId,
                });

                delete uploadMetadata[fileUUID];
                if (fs.existsSync(chunk.path)) {
                    fs.unlinkSync(chunk.path);
                }

                return res.status(500).json({ error: 'Failed to upload part to S3.' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
