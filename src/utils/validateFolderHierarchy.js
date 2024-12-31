import { connectFileSystem } from "../../database/connect";

const validateFolderHierarchy = async (folderPath) => {
    let parentId = 'root'; // Start at the root
    const db = connectFileSystem();

    for (const folderName of folderPath) {
        const folderId = await new Promise((resolve, reject) => {
            // Check if the folder exists in the given parent
            db.get(
                `SELECT id FROM folders WHERE name = ? AND parent_id IS ?`,
                [folderName, parentId],
                (err, row) => {
                    if (err) return reject(err);
                    if (row) {
                        resolve(row.id); // Folder exists, return its ID
                    } else {
                        reject(new Error(`Folder '${folderName}' does not exist in the hierarchy.`));
                    }
                }
            );
        });

        // Set the parentId for the next folder in the hierarchy
        parentId = folderId;
    }

    return parentId; // Return the ID of the last folder in the hierarchy
};

export default validateFolderHierarchy;