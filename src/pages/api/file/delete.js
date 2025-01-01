import S3Client from '@/utils/S3Client';
import { connectFileSystem } from '../../../../database/connect';

const s3 = S3Client;

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { fileId, fileIds } = req.body;

        if (!fileId && (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0)) {
            return res.status(400).json({ error: 'Provide a fileKey for single deletion or an array of fileKeys for multiple deletions.' });
        }

        const db = connectFileSystem();

        try {
            if (fileId) {
                // // Handle single file deletion
                // const params = {
                //     Bucket: process.env.AWS_S3_BUCKET,
                //     Key: fileId,
                // };
                // await s3.deleteObject(params).promise();

                await db.run(`DELETE FROM files WHERE id = ?`, fileId);

                console.log(`File ${fileId} deleted successfully`);
                return res.status(200).json({ message: `File ${fileId} deleted successfully` });
            }

            if (fileIds) {
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
