// pages/api/file/stream.js
import AWS from "aws-sdk";
import { jwtVerify } from "jose";

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function handler(req, res) {
    const { key } = req.query;
    const range = req.headers.range;

    if (!key) return res.status(400).send("Missing key");

    try {
        const token = req.cookies.authToken;
        if (!token) throw new Error("Not authenticated");

        const { payload } = await jwtVerify(token, secret);
        const username = payload.username;

        const head = await s3
            .headObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
            .promise();

        const contentType = head.ContentType || "application/octet-stream";
        const total = head.ContentLength;

        if (range) {
            const positions = range.replace(/bytes=/, "").split("-");
            const start = parseInt(positions[0], 10);
            const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            const contentLength = end - start + 1;

            const stream = s3
                .getObject({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: key,
                    Range: `bytes=${start}-${end}`,
                })
                .createReadStream();

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${total}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": contentType,
            });

            stream.pipe(res);
        } else {
            const stream = s3
                .getObject({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: key,
                })
                .createReadStream();

            res.writeHead(200, {
                "Content-Length": total,
                "Content-Type": contentType,
                "Cache-Control": "no-store", // or "private" depending on your auth model
            });

            stream.pipe(res);
        }
    } catch (err) {
        console.error("Streaming error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
}
