import S3Client from '@/utils/S3Client';

const s3 = S3Client;

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { fileKey, fileKeys } = req.body;

        if (!fileKey && (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0)) {
            return res.status(400).json({ error: 'Provide a fileKey for single deletion or an array of fileKeys for multiple deletions.' });
        }

        try {
            if (fileKey) {
                // Handle single file deletion
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: fileKey,
                };
                await s3.deleteObject(params).promise();
                console.log(`File ${fileKey} deleted successfully`);
                return res.status(200).json({ message: `File ${fileKey} deleted successfully` });
            }

            if (fileKeys) {
                // Handle multiple file deletions
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Delete: {
                        Objects: fileKeys.map((key) => ({ Key: key })),
                        Quiet: true, // Suppresses individual results in response
                    },
                };
                const deleteResponse = await s3.deleteObjects(params).promise();
                console.log('Delete response:', deleteResponse);

                return res.status(200).json({
                    message: 'Files deleted successfully',
                    deletedFiles: deleteResponse.Deleted,
                    errors: deleteResponse.Errors,
                });
            }
        } catch (error) {
            console.error('Error deleting file(s):', error);
            return res.status(500).json({ error: 'Error deleting file(s) from S3' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
