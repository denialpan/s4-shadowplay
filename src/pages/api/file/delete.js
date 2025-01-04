import S3Client from '@/utils/S3Client';
import { connectFileSystem } from '../../../../database/connect';

const s3 = S3Client;

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { files, folders } = req.body;

        console.log(files, folders);

        if (!files && !folders) {
            return res.status(400).json({ error: 'Provide a fileKey for single deletion or an array of fileKeys for multiple deletions.' });
        }

        const fileIds = files.map((file) => file.Id);
        const folderIds = folders.map((folder) => folder.Id);

        console.log(folderIds);

        const db = connectFileSystem();

        try {

            // // Handle single file deletion
            // const params = {
            //     Bucket: process.env.AWS_S3_BUCKET,
            //     Key: fileId,
            // };
            // await s3.deleteObject(params).promise();

            if (fileIds.length > 0) {
                // // Handle multiple file deletions
                // const params = {
                //     Bucket: process.env.AWS_S3_BUCKET,
                //     Delete: {
                //         Objects: fileKeys.map((key) => ({ Key: key })),
                //         Quiet: true, // Suppresses individual results in response
                //     },
                // };
                // const deleteResponse = await s3.deleteObjects(params).promise();

                const placeholders = fileIds.map(() => "?").join(","); // Create ?,?,? placeholders

                await db.run(`DELETE FROM files WHERE id IN (${placeholders})`,
                    fileIds,
                    (err, rows) => {
                        if (err) {
                            console.error('Error querying folders:', err.message);
                            return;
                        }
                    });

                return res.status(200).json({
                    message: "drew got executed successfully"
                });
            }

            if (folderIds.length > 0) {
                // // Handle multiple file deletions
                // const params = {
                //     Bucket: process.env.AWS_S3_BUCKET,
                //     Delete: {
                //         Objects: fileKeys.map((key) => ({ Key: key })),
                //         Quiet: true, // Suppresses individual results in response
                //     },
                // };
                // const deleteResponse = await s3.deleteObjects(params).promise();

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

                return res.status(200).json({
                    message: "drew got executed successfully"
                });
            }

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
