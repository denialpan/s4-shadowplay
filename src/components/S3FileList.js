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
            setFiles(conditional);

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
                data: { fileKey },
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
        <div className="p-4">
            <DataTable columns={columns(fetchFiles)} data={files} fetchFiles={fetchFiles} />
        </div>
    );
};

export default S3FileList;
