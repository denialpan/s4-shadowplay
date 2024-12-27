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
    const [data, setData] = useState({ folders: [], files: [] })
    const [loading, setLoading] = useState(true);

    const fetchFolderContents = async () => {
        setLoading(true);

        const folderPath = "";

        try {
            const response = await axios.get(`/api/file/folder?folderPath=${encodeURIComponent(folderPath)}`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching folder contents:", error);
            setData({ folders: [], files: [] });
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchFolderContents();
    }, [refreshFilesTrigger]);

    const combinedData = [
        ...data.folders.map((folder) => ({
            Key: folder.Key,
            Type: "Folder",
            Name: folder.Key.replace(/\/$/, ""),
            Size: "-",
            LastModified: "-",
        })),
        ...data.files.map((file) => ({
            Key: file.Key,
            Type: "File",
            Name: file.Key.split("/").pop(),
            Size: file.Size,
            LastModified: file.LastModified,
        })),
    ];

    if (loading) return <p>Loading files...</p>;

    return (
        <div className="p-4">
            <DataTable columns={columns(fetchFolderContents)} data={files} fetchFiles={fetchFolderContents} />
        </div>
    );
};

export default S3FileList;
