import AWS from "aws-sdk";
import S3Client from "@/utils/S3Client";

const s3 = S3Client;

export default async function handler(req, res) {
    const { folderPath } = req.query; // Extract folder path from query

    // Default to the root directory if no folderPath is provided
    const folderKey = folderPath ? `${folderPath}/` : "";

    const params = {
        Bucket: "s4-shadowplay",
        Prefix: folderKey, // Query objects with the folderPath as prefix
        Delimiter: "/",    // Group objects into folders
    };

    try {
        const data = await s3.listObjectsV2(params).promise();

        // Map folder prefixes
        const folders = data.CommonPrefixes?.map((cp) => ({
            Key: cp.Prefix,
        })) || [];

        // Map file details
        const files = data.Contents?.map((content) => ({
            Key: content.Key,
            LastModified: content.LastModified,
            Size: content.Size,
        })) || [];

        res.status(200).json({
            folders, // Return folders as an array of objects
            files,   // Return files with details
        });
    } catch (error) {
        console.error("S3 Error:", error);
        res.status(500).json({ error: "Failed to retrieve folder contents" });
    }
}
