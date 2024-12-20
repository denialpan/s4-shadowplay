import S3FileList from '@/components/S3FileList';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/router';

const index = () => {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [refreshFilesTrigger, setRefreshFilesTrigger] = useState(0);

    const router = useRouter();

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

    const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_CHUNKS = 100; // maximum number of chunks

    const uploadFiles = (confirmedFiles) => {
        confirmedFiles.forEach(async (fileObject) => {
            const file = fileObject.file;

            if (file.size === 0) {
                console.error("File size is 0 bytes.");
                setFiles((prevFiles) =>
                    prevFiles.filter((fileItem) => fileItem.fileUUID !== fileObject.fileUUID)
                );
                return;
            }

            // determine chunk size dynamically
            const chunkSize = file.size > DEFAULT_CHUNK_SIZE * MAX_CHUNKS
                ? Math.ceil(file.size / MAX_CHUNKS)
                : DEFAULT_CHUNK_SIZE;

            const totalChunks = Math.ceil(file.size / chunkSize);
            console.log(`File info: size=${file.size}, chunkSize=${chunkSize}, totalChunks=${totalChunks}`);

            let uploadedChunks = 0;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);

                // check chunk slicing
                console.log(`Chunk ${chunkIndex + 1}: start=${start}, end=${end}, size=${end - start}`);

                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('name', file.name);
                formData.append('type', file.type);
                formData.append('fileUUID', fileObject.fileUUID);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);

                try {
                    const response = await axios.post('/api/file/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        timeout: 60000,
                    });

                    if (response.status === 200) {
                        uploadedChunks++;
                        const percentComplete = Math.round((uploadedChunks / totalChunks) * 100);
                        setUploadProgress((prev) => ({
                            ...prev,
                            [fileObject.fileUUID]: percentComplete,
                        }));
                    } else {
                        console.error(`Error uploading chunk ${chunkIndex + 1} for file ${file.name}`);
                    }
                } catch (error) {
                    console.error(
                        `An error occurred while uploading chunk ${chunkIndex + 1} for file ${file.name}:`,
                        error
                    );
                    break;
                }
            }

            if (uploadedChunks === totalChunks) {
                console.log(`File ${file.name} uploaded successfully!`);
                setFiles((prevFiles) =>
                    prevFiles.filter((fileItem) => fileItem.fileUUID !== fileObject.fileUUID)
                );
                setRefreshFilesTrigger((prev) => prev + 1);
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
                            <p>Upload Progress: {uploadProgress[fileUUID] || 0}%</p>
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
