import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { fileId } = req.query;

    if (!fileId) {
        return res.status(400).json({ error: "Missing file ID" });
    }

    const db = connectFileSystem();

    try {
        const assignedTags = await new Promise((resolve, reject) => {
            db.all(
                `SELECT tags.id, tags.name 
                 FROM tags 
                 JOIN file_tags ON tags.id = file_tags.tag_id
                 WHERE file_tags.file_id = ?`,
                [fileId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows || []);
                }
            );
        });

        res.status(200).json({ tags: assignedTags.map(tag => ({ value: tag.id, label: tag.name })) });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to fetch assigned tags" });
    } finally {
        db.close();
    }
}
