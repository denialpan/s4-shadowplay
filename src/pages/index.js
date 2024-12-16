import S3FileList from '@/components/S3FileList';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/router';

const index = () => {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [s3Progress, setS3Progress] = useState({});
    const [refreshFilesTrigger, setRefreshFilesTrigger] = useState(0);

    const router = useRouter();

    useEffect(() => {
        if (files.length > 0) {
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

    }, [files]);

    const handleFiles = (selectedFiles) => {
        const filesWithUUIDs = Array.from(selectedFiles).map((file) => ({
            file,
            fileUUID: uuidv4(), // unique uuid for file
        }));
        setFiles((prevFiles) => [...prevFiles, ...filesWithUUIDs]);
        uploadFiles(filesWithUUIDs);

    };

    const handleSignOut = async () => {
        try {
            // Call the sign-out API to clear the cookie
            await axios.post('/api/user/logout');

            // Redirect to the login page
            router.push('/login');

        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    };

    const manualFileUpload = (e) => {
        handleFiles(e.target.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const uploadFiles = (confirmedFiles) => {

        confirmedFiles.forEach(async (fileObject) => {
            const formData = new FormData();
            formData.append('file', fileObject.file);
            formData.append('name', fileObject.file.name);
            formData.append('type', fileObject.file.type);
            formData.append('fileUUID', fileObject.fileUUID);

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
                    setFiles((prevFiles) =>
                        prevFiles.filter((fileItem) => fileItem.fileUUID !== fileObject.fileUUID)
                    );
                    setRefreshFilesTrigger((prev) => prev + 1);
                } else {
                    console.error(`Error uploading file ${fileObject.file.name}`);
                }
            } catch (error) {
                console.error(`An error occurred during the file upload for ${fileObject.file.name}:`, error);
            }
        });
    };

    return (
        <div>

            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    border: '2px dashed #ccc',
                    borderRadius: '0px',
                    padding: '20px',
                    textAlign: 'center',
                }}>

                <h2>s4-shadowplay</h2>
                <input type="file" multiple onChange={manualFileUpload} />

                <ul>
                    {files.map(({ file, fileUUID }) => (
                        <li key={fileUUID}>
                            <p>{file.name}</p>
                            <p>Client-to-Backend Progress: {uploadProgress[fileUUID] || 0}%</p>
                            <p>Backend-to-S3 Progress: {s3Progress[fileUUID] || 0}%</p>
                        </li>
                    ))}
                </ul>

            </div>
            <button onClick={handleSignOut}> SIGN OUT </button>
            <S3FileList refreshFilesTrigger={refreshFilesTrigger} />
        </div>
    );
};

export default index;
