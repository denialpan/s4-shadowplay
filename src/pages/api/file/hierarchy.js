import AWS from "aws-sdk";
import S3Client from "@/utils/S3Client";
import { connectFileSystem } from "../../../../database/connect";

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

    const db = connectFileSystem();
    try {

        const allFolders = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM folders`,
                (err, rows) => {
                    if (err) {
                        console.error('Error querying folders:', err.message);
                        return;
                    }
                    resolve(rows);
                }
            )

        })

        const allFiles = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM files`,
                (err, rows) => {
                    if (err) {
                        console.error('Error querying files:', err.message);
                        return;
                    }
                    resolve(rows);
                }
            )

        })

        res.status(200).json({
            allFolders,
            allFiles,
        })

    } catch (error) {
        console.error("S3 Error:", error);
        res.status(500).json({ error: "Failed to retrieve folder contents" });
    } finally {
        console.log("database closed");
        db.close();
    }


}
