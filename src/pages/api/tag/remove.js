import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { fileId, tagId } = req.body;

    if (!fileId || !tagId) {
        return res.status(400).json({ error: "Missing fileId or tagId" });
    }

    const db = connectFileSystem();

    try {
        await new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?`,
                [fileId, tagId],
                function (err) {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.status(200).json({ message: "Tag removed successfully" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to remove tag" });
    } finally {
        db.close();
    }
}
