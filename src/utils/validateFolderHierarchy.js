import { connectFileSystem } from "../../database/connect";

const validateFolderHierarchy = async (folderPath) => {
    let parentId = 'root';
    const db = connectFileSystem();

    for (const folderName of folderPath) {
        const folderId = await new Promise((resolve, reject) => {

            db.get(
                `SELECT id FROM folders WHERE name = ? AND parent_id IS ?`,
                [folderName, parentId],
                (err, row) => {
                    if (err) return reject(err);
                    if (row) {
                        resolve(row.id); // Folder exists, return its ID
                    } else {
                        // reject(new Error(`Folder '${folderName}' does not exist in the hierarchy.`));
                        resolve(-1);
                    }
                }
            );
        });

        // iterate down to next folder
        parentId = folderId;
    }

    return parentId; // Return the ID of the last folder in the hierarchy
};

export default validateFolderHierarchy;