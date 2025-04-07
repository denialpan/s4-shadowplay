import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { fileId, tags } = req.body; // tags should be an array of tag IDs

    if (!fileId || !Array.isArray(tags) || tags.length === 0) {
        console.log(tags);
        return res.status(400).json({ error: "Invalid input" });
    }

    const db = connectFileSystem();

    try {
        // Check if the file exists
        const fileExists = await new Promise((resolve, reject) => {
            db.get(`SELECT id FROM files WHERE id = ?`, [fileId], (err, row) => {
                if (err) reject(err);
                resolve(row ? true : false);
            });
        });

        if (!fileExists) {
            return res.status(400).json({ error: "File does not exist" });
        }

        // Check if all tags exist
        const validTags = [];
        for (const tagId of tags) {
            const tagExists = await new Promise((resolve, reject) => {
                db.get(`SELECT id FROM tags WHERE id = ?`, [tagId], (err, row) => {
                    if (err) reject(err);
                    resolve(row ? true : false);
                });
            });

            if (tagExists) {
                validTags.push(tagId);
            } else {
                console.warn(`Tag ID ${tagId} does not exist, skipping.`);
            }
        }

        if (validTags.length === 0) {
            return res.status(400).json({ error: "No valid tags to assign" });
        }

        // Insert into file_tags
        for (const tagId of validTags) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO file_tags (file_id, tag_id) VALUES (?, ?) ON CONFLICT(file_id, tag_id) DO NOTHING;`,
                    [fileId, tagId],
                    (err) => (err ? reject(err) : resolve())
                );
            });
        }

        res.status(201).json({ message: "Tags assigned successfully" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to assign tags" });
    } finally {
        db.close();
    }
}
