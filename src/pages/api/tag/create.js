import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { name } = req.body; // Extract tag name from request body

    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Invalid tag name" });
    }

    const db = connectFileSystem();

    try {
        // Insert the tag, ignoring duplicates
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING;`,
                [name],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });

        res.status(201).json({ message: "Tag created successfully", name });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to create tag" });
    } finally {
        db.close();
    }
}
