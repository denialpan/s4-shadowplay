import { useState, useEffect } from 'react';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');


    const [uploadProgress, setUploadProgress] = useState(0); // browser to backend progress
    const [s3Progress, setS3Progress] = useState(0); // backend to S3 progress

    useEffect(() => {
        const sse = new EventSource('/api/upload');
        console.log("SSE connection opened");

        // progress from sse backend
        sse.onmessage = function (event) {
            console.log("Received progress from backend:", event.data);
            const progress = Number(event.data);
            if (!isNaN(progress)) {
                setS3Progress(progress);
            }
        };

        sse.onerror = function (error) {
            console.error("SSE error:", error);
        };

        return () => {
            console.log(" FRONTEND SSE connection closed");
            sse.close();
        };
    }, []);


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage('');

        setUploadProgress(0);
        setS3Progress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('type', file.type);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');

        // Track client-to-server upload progress
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                setMessage('File uploaded successfully!');
            } else {
                setMessage(`Error uploading file: ${xhr.responseText}`);
            }
            setLoading(false);
        };

        xhr.onerror = function () {
            setMessage('An error occurred during the file upload.');
            setLoading(false);
        };

        xhr.send(formData);
    };

    return (
        <div>
            <h2>File Upload with Progress</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>Upload</button>
            </form>

            {loading && (
                <div>
                    <p>Client to Backend Progress: {uploadProgress}%</p>
                    <p>Backend to S3 Progress: {s3Progress}%</p>
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    );
};

export default FileUpload;
