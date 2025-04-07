import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const db = connectFileSystem();

    try {
        const tags = await new Promise((resolve, reject) => {
            db.all(`SELECT id, name FROM tags`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.status(200).json({ tags: tags.map(tag => ({ value: tag.id, label: tag.name })) });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to retrieve tags" });
    } finally {
        db.close();
    }
}
