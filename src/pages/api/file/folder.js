import validateFolderHierarchy from "@/utils/validateFolderHierarchy";
import generateTimeUUID from "@/utils/generateTimeUUID";
import { connectFileSystem } from "../../../../database/connect";

export default async function handler(req, res) {

    // create new folder in parent directory
    if (req.method === "POST") {

        const { folderPath, newFolderName } = req.body;
        console.log(folderPath + " " + newFolderName);
        const db = connectFileSystem();

        try {
            const parentId = await validateFolderHierarchy(folderPath.split('/').filter((segment) => segment.trim() !== ''));
            const folderId = await generateTimeUUID();

            await db.run(
                `INSERT INTO folders (id, name, parent_id) VALUES (?, ?, ?)`,
                [folderId, newFolderName, parentId],
                function (err) {
                    if (err) {
                        console.error('Error creating folder:', err.message);
                    } else {
                        console.log('Folder created successfully:', folderId);
                    }
                }
            );

            res.status(201).json({ message: 'Folder created successfully.' })

        } catch (error) {
            console.error('Error creating folder:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        } finally {
            db.close();
        }

    }

}