import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { query, minSize, maxSize, type, file_extension, owner, startDate, endDate, tags } = req.query;
    const db = connectFileSystem();

    try {
        console.log(req.query)
        let sql = `
            SELECT 
                files.id, files.name, files.s3_key, files.folder_id, files.size, 
                files.type, files.file_extension, files.created_at, files.modified_at, 
                users.username AS owner,
                GROUP_CONCAT(tags.name) AS tag_names
            FROM files
            LEFT JOIN users ON files.owner = users.id
            LEFT JOIN file_tags ON files.id = file_tags.file_id
            LEFT JOIN tags ON file_tags.tag_id = tags.id
        `;

        let conditions = [];
        let params = [];

        if (query) {
            conditions.push("LOWER(files.name) LIKE ?");
            params.push(`%${query.toLowerCase()}%`);
        }
        if (minSize) {
            conditions.push("files.size >= ?");
            params.push(minSize);
        }
        if (maxSize) {
            conditions.push("files.size <= ?");
            params.push(maxSize);
        }
        if (type) {
            conditions.push("files.type = ?");
            params.push(type);
        }
        if (owner) {
            conditions.push("users.username = ?");
            params.push(owner);
        }
        if (startDate) {
            conditions.push("files.created_at >= ?");
            params.push(startDate);
        }
        if (endDate) {
            conditions.push("files.created_at <= ?");
            params.push(endDate);
        }
        if (tags !== undefined) {
            const tagList = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0); // filter out empty strings

            if (tagList.length > 0) {
                conditions.push(`files.id IN (
                    SELECT file_tags.file_id 
                    FROM file_tags 
                    JOIN tags ON file_tags.tag_id = tags.id
                    WHERE tags.name IN (${tagList.map(() => "?").join(",")})
                    GROUP BY file_tags.file_id
                    HAVING COUNT(DISTINCT tags.name) = ?
                )`);
                params.push(...tagList, tagList.length);
            }
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += `
            GROUP BY files.id
            ORDER BY files.created_at DESC;
        `;

        // Then fetch and transform the results
        const results = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                const processed = rows.map(({ tag_names, ...file }) => ({
                    ...file,
                    tags: tag_names ? tag_names.split(",") : []
                }));
                resolve(processed);
            });
        });

        res.status(200).json({ files: results });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to search files" });
    } finally {
        db.close();
    }
}
