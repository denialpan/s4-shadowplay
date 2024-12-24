import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { columns, IndividualFile } from './fileTable/columns';
import { DataTable } from './fileTable/data-table';

const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (dateString) => {
    const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", options).format(date);
};

const S3FileList = ({ refreshFilesTrigger }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        try {
            const res = await axios.get('/api/file/retrieve');
            const conditional = res.data.files || [];
            console.log(conditional);

            setFiles(conditional);
            setFiles((prevFiles) =>
                prevFiles.map((file) => ({
                    ...file, // Copy the existing properties
                    LastModified: formatDate(file.LastModified),
                    Size: formatFileSize(file.Size),
                    Owner: "DREW GETTING ON TIKTOK", // Add the new "Owner" property
                }))
            );

        } catch (err) {
            console.error('Error fetching S3 files', err);
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
            const response = await axios.delete('/api/file/delete', {
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
            {/* <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        {file.Key} - {formatFileSize(file.Size)}
                        <button onClick={() => handleDelete(file.Key)} style={{ marginLeft: '10px' }}>
                            [x]
                        </button>
                    </li>
                ))}
            </ul> */}
            <DataTable columns={columns} data={files} />
        </div>
    );
};

export default S3FileList;
