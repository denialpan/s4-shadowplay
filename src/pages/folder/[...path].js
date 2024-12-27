import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

import { columns, IndividualFile } from '@/components/fileTable/columns';
import { DataTable } from "@/components/fileTable/data-table";

export default function FolderPage() {
    const router = useRouter();
    const { path } = router.query;

    const [data, setData] = useState({ folders: [], files: [] });
    const [loading, setLoading] = useState(true);


    const fetchFolderContents = async () => {
        if (!path) return;
        setLoading(true);

        const folderPath = Array.isArray(path) ? path.join("/") : "";

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

    useEffect(() => {
        fetchFolderContents();
    }, [path]);

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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <div>
                <h2>Files in {path}:</h2>
                <DataTable columns={columns(fetchFolderContents)} data={combinedData} />
            </div>
        </div>
    );
}
