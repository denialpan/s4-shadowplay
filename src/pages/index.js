import { useState } from 'react';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage('');

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result;

            // Create an object with file details
            const fileData = {
                file: base64data,
                name: file.name, // Include the file name
                type: file.type, // Include the file type
            };

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fileData), // Send the fileData object
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.error);
            }
            setLoading(false);
        };

        reader.readAsDataURL(file);
    };


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>Upload</button>
            </form>
            {loading && <p>Uploading...</p>}
            {message && <p>{message}</p>}
        </div>
    );
};

export default FileUpload;
