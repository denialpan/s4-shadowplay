import React, { useEffect, useState } from 'react';
import generateTimeUUID from '@/utils/generateTimeUUID';
import axios from 'axios';
import { useRouter } from 'next/router';

import { columns, IndividualFile } from './fileTable/columns';
import { DataTable } from './fileTable/data-table';

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

axios.defaults.withCredentials = true;

const AllFileInteraction = ({ path }) => {

    // display table consts
    const [files, setFiles] = useState([]);
    const [data, setData] = useState({ subFiles: [], subFolders: [] })
    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(true);

    // upload files consts
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [s3Progress, setS3Progress] = useState({});
    const router = useRouter();

    const fetchFolderContents = async () => {

        let folderPath = "";
        if (path) {
            folderPath = Array.isArray(path) ? path.join("/") : "";
        }

        await axios.get(`/api/file/retrieve`, {
            params: {
                folderPath: folderPath,
            }
        }).then((response) => {

            console.log(response.data);
            setData(response.data || []);

        }).catch(function (error) {

            if (error.response) {
                setValid(false);
                setData({ subFolders: [], subFiles: [] });
            }
        }).finally(() => {
            setLoading(false);
        });

    };

    useEffect(() => {

        if (uploadFiles.length > 0) {
            const sse = new EventSource('/api/file/upload');

            sse.onmessage = function (event) {
                const { fileUUID, progress } = JSON.parse(event.data);
                setS3Progress((prev) => ({
                    ...prev,
                    [fileUUID]: progress,
                }));
            };

            sse.onerror = function (error) {
                console.error('SSE error:', error);
                sse.close();
            };

            return () => {
                sse.close();
            };
        }

        // display table operations
        setLoading(true);
        fetchFolderContents();
    }, [path, uploadFiles]);

    const combinedData = [
        ...data.subFolders.map((folder) => ({
            Name: folder.name,
            Type: "-",
            Size: "-",
            Owner: folder.owner,
            Created: folder.created_at,
            Modified: folder.modified_at,

            RowType: "Folder",
            Id: folder.id,
            Parent: folder.parent_id,
        })),
        ...data.subFiles.map((file) => ({
            Name: file.name,
            Type: file.type,
            Size: file.size,
            Owner: file.owner,
            Created: file.created_at,
            Modified: file.modified_at,

            RowType: "File",
            Id: file.id,
            Folder: file.folder_id,
        })),
    ];

    // upload 

    const handleFiles = async (selectedFiles) => {
        const filesWithUUIDs = await Promise.all(
            Array.from(selectedFiles).map(async (file) => ({
                file,
                fileUUID: await generateTimeUUID(), // Assuming generateTimeUUID is async
            }))
        );
        setUploadFiles((prevFiles) => [...prevFiles, ...filesWithUUIDs]);
        processUploadFiles(filesWithUUIDs);

    };

    const manualFileUpload = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const processUploadFiles = (confirmedFiles) => {

        console.log(router.asPath.replace('/folder/', ''));

        confirmedFiles.forEach(async (fileObject) => {

            console.log(fileObject);
            if (fileObject.file.size === 0) {
                console.log("NICK");
                setFiles((prevFiles) =>
                    prevFiles.filter((fileItem) => fileItem.fileUUID !== fileObject.fileUUID)
                );
                return;
            }
            const formData = new FormData();
            formData.append('file', fileObject.file);
            formData.append('name', fileObject.file.name);
            formData.append('type', fileObject.file.type);
            formData.append('fileUUID', fileObject.fileUUID);

            if (router.asPath !== '/') {
                formData.append('path', router.asPath.replace('/folder/', ''))
            }

            try {
                const response = await axios.post('/api/file/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentComplete = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress((prev) => ({
                            ...prev,
                            [fileObject.fileUUID]: percentComplete,
                        }));
                    },
                });

                if (response.status === 200) {
                    console.log(`File ${fileObject.file.name} uploaded successfully!`);
                    // Remove the uploaded file from the `files` state
                    setUploadFiles((prevFiles) =>
                        prevFiles.filter((fileItem) => fileItem.fileUUID !== fileObject.fileUUID)
                    );
                } else {
                    console.error(`Error uploading file ${fileObject.file.name}`);
                }
            } catch (error) {
                console.error(`An error occurred during the file upload for ${fileObject.file.name}:`, error);
            }
        });
    };

    const handleNewFolder = async () => {
        console.log("NEW FOLDER " + router.asPath);
        let folderPath = "";
        if (path) {
            folderPath = Array.isArray(path) ? path.join("/") : "";
        }
        const response = await axios.post(`/api/file/folder`, {
            folderPath: folderPath,
            newFolderName: "drew",
        });
    }


    if (loading) return <p className="p-4">Loading files...</p>;

    return (

        <div className="p-4">

            {(!valid) ? (
                <div> This directory doesn't exist. </div>
            ) : (
                <div>

                    <ContextMenu>
                        <ContextMenuTrigger>Right click</ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={() => handleNewFolder()}>new folder</ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{
                            border: '2px dashed #ccc',
                            borderRadius: '0px',
                            padding: '20px',
                            marginBlock: '20px',
                            textAlign: 'center',
                        }}>

                        <input type="file" multiple onChange={manualFileUpload} />

                        <ul>
                            {uploadFiles.map(({ file, fileUUID }) => (
                                <li key={fileUUID}>
                                    <p>{file.name}</p>
                                    <p>Client-to-Backend Progress: {uploadProgress[fileUUID] || 0}%</p>
                                    <p>Backend-to-S3 Progress: {s3Progress[fileUUID] || 0}%</p>
                                </li>
                            ))}
                        </ul>

                    </div>

                    <DataTable columns={columns(fetchFolderContents)} data={combinedData} fetchFiles={fetchFolderContents} />
                </div>
            )}

        </div >
    );
};

export default AllFileInteraction;
