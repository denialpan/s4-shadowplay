import S3Client from '@/utils/S3Client';
import { connectFileSystem } from '../../../../database/connect';

const s3 = S3Client;

async function getAllDescendantFolderIds(db, parentFolderIds) {
    const allFolderIds = new Set(parentFolderIds);

    const queue = [...parentFolderIds];
    while (queue.length > 0) {
        const currentId = queue.pop();

        const children = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id FROM folders WHERE parent_id = ?`,
                [currentId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map((row) => row.id));
                }
            );
        });

        for (const childId of children) {
            if (!allFolderIds.has(childId)) {
                allFolderIds.add(childId);
                queue.push(childId);
            }
        }
    }

    return Array.from(allFolderIds);
}

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { files, folders } = req.body;

        console.log(files, folders);

        if (!files && !folders) {
            return res.status(400).json({ error: 'Provide a fileKey for single deletion or an array of fileKeys for multiple deletions.' });
        }

        const db = connectFileSystem();

        const fileIds = files.map((file) => file.Id);
        const folderIds = folders.map((folder) => folder.Id);
        const s3Keys = files.map((file) => ({ Key: file.S3Key }));

        let s3KeysToDelete = [];

        if (folderIds.length > 0) {
            const allRelatedFolderIds = await getAllDescendantFolderIds(db, folderIds);

            const placeholders = allRelatedFolderIds.map(() => "?").join(",");
            const filesInFolders = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT s3_key FROM files WHERE folder_id IN (${placeholders})`,
                    allRelatedFolderIds,
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            s3KeysToDelete = filesInFolders.map((row) => ({ Key: row.s3_key }));
        }




        try {

            const allS3Keys = [...s3Keys, ...s3KeysToDelete];

            if (allS3Keys.length > 0) {
                await s3.deleteObjects({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Delete: { Objects: allS3Keys, Quiet: true },
                }).promise();
            }

            if (fileIds.length > 0) {

                const placeholders = fileIds.map(() => "?").join(","); // Create ?,?,? placeholders

                await db.run(`DELETE FROM files WHERE id IN (${placeholders})`,
                    fileIds,
                    (err, rows) => {
                        if (err) {
                            console.error('Error querying folders:', err.message);
                            return;
                        }
                    });
            }

            if (folderIds.length > 0) {

                const placeholders = folderIds.map(() => "?").join(","); // Create ?,?,? placeholders
                console.log(placeholders);
                await db.run(`DELETE FROM folders WHERE id IN (${placeholders})`,
                    folderIds,
                    (err, rows) => {
                        if (err) {
                            console.error('Error querying folders:', err.message);
                            return;
                        }
                    });

            }
            return res.status(200).json({
                message: "drew got executed successfully"
            });

        } catch (error) {
            console.error('Error deleting file(s):', error);
            return res.status(500).json({ error: 'Error deleting file(s) from S3' });
        } finally {
            db.close();
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
