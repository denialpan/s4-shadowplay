import S3Client from '@/utils/S3Client';
import { connectFileSystem } from '../../../../database/connect';

const s3 = S3Client;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { files, folders, targetFolder } = req.body;

        const db = connectFileSystem();
        const fileIds = files.map((file) => file.Id);
        const folderIds = folders.map((folder) => folder.Id);

        const filePlaceholders = fileIds.map(() => "?").join(",");

        const folderPlaceholders = folderIds.map(() => "?").join(",");

        try {

            await db.run(
                `UPDATE files SET folder_id = ? WHERE id IN (${filePlaceholders})`,
                [targetFolder, ...fileIds]
            );

            await db.run(
                `UPDATE folders SET parent_id = ? WHERE id IN (${folderPlaceholders})`,
                [targetFolder, ...folderIds]
            );

            return res.status(200).json({
                message: "does this message matter actually, nah",
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