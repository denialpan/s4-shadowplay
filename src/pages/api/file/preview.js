// /api/file/preview.js
import AWS from "aws-sdk";

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export default function handler(req, res) {
    const { key } = req.query;

    if (!key) return res.status(400).json({ error: "Missing key" });

    try {
        const url = s3.getSignedUrl("getObject", {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Expires: 120,
        });

        res.status(200).json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate preview URL" });
    }
}
