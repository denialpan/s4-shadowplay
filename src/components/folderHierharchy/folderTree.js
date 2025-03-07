import { useRouter } from "next/router"
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from 'react'
import axios from "axios";


const buildFolderTree = (folders) => {
    const folderMap = {}; // Store folders by id
    const tree = [];

    // Initialize folder entries in folderMap
    folders.forEach((folder) => {
        folderMap[folder.id] = { ...folder, children: [] };
    });

    // Build the tree by linking children to their parents
    folders.forEach((folder) => {
        if (folder.parent_id === "root") {
            tree.push(folderMap[folder.id]); // Root-level folders
        } else if (folderMap[folder.parent_id]) {
            folderMap[folder.parent_id].children.push(folderMap[folder.id]);
        }
    });

    return tree;
};

const FolderTreeView = ({ nodes }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (id) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: !prev[id], // Toggle expand state
        }));
    };

    return (
        <ul className="pl-4">
            {nodes.map((node) => (
                <li key={node.id} className="list-none">
                    <div className="flex items-center cursor-pointer" onClick={() => toggleExpand(node.id)}>
                        {node.children.length > 0 ? (
                            <span className="mr-2">{expanded[node.id] ? "📂" : "📁"}</span>
                        ) : (
                            <span className="mr-2">📁</span>
                        )}
                        <span>{node.name}</span>
                    </div>

                    {/* Render children if expanded */}
                    {expanded[node.id] && node.children.length > 0 && (
                        <FolderTreeView nodes={node.children} />
                    )}
                </li>
            ))}
        </ul>
    );
};

const FolderTree = () => {
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        const getFolderData = async () => {
            try {
                const response = await axios.get("/api/file/hierarchy");
                const structuredFolders = buildFolderTree(response.data.allFolders);
                setFolders(structuredFolders);
            } catch (error) {
                console.error("Error fetching folder data:", error);
            }
        };

        getFolderData();
    }, []);

    return (
        <div className="p-4 border rounded-md">
            <FolderTreeView nodes={folders} />
        </div>
    );
};

export default FolderTree;