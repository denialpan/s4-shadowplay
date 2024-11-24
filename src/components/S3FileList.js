import React, { useEffect, useState } from 'react';
import axios from 'axios';

const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const S3FileList = ({ refreshFilesTrigger }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        try {
            const res = await axios.get('/api/FileRetrieve');
            setFiles(res.data.files);
        } catch (err) {
            console.error("Error fetching S3 files", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [refreshFilesTrigger]);

    // handle file deletion
    const handleDelete = async (fileKey) => {
        try {
            const response = await axios.delete('/api/FileDelete', {
                data: { fileKey },  // file key in request body
            });

            if (response.status === 200) {
                console.log(`File ${fileKey} deleted successfully`);
                fetchFiles();
            }
        } catch (error) {
            console.error(`Error deleting file ${fileKey}:`, error);
        }
    };

    if (loading) return <p>Loading files...</p>;

    return (
        <div>
            <h2>Files in S3 Bucket</h2>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        {file.Key} - {formatFileSize(file.Size)}
                        <button onClick={() => handleDelete(file.Key)} style={{ marginLeft: '10px' }}>
                            [x]
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default S3FileList;
