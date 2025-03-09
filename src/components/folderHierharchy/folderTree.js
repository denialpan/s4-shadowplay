import { useRouter } from "next/router"
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from 'react'
import { Folder, Settings, ArrowLeftFromLine, ChevronDown, ChevronRight, FilePen, FolderOpen } from "lucide-react"
import { Button } from "../ui/button";
import axios from "axios";

const buildFolderTree = (folders) => {

    const folderMap = {};
    const tree = [];
    const queue = [];

    folders.forEach((folder) => {
        folderMap[folder.id] = { ...folder, children: [] };
    });

    folders.forEach((folder) => {
        if (folder.parent_id === "root") {
            tree.push(folderMap[folder.id]);
        } else if (folderMap[folder.parent_id]) {
            folderMap[folder.parent_id].children.push(folderMap[folder.id]);
        }
    });

    // add urls to tree
    tree.forEach((rootFolder) => {
        rootFolder.url = `/folder/${rootFolder.name}`;
        queue.push(rootFolder);
    });

    while (queue.length > 0) {
        const currentFolder = queue.shift();

        currentFolder.children.forEach((childFolder) => {
            childFolder.url = `${currentFolder.url}/${childFolder.name}`;
            queue.push(childFolder);
        });
    }

    return tree;
};

// recursive component
const FolderTreeView = ({ nodes }) => {
    const [expanded, setExpanded] = useState({});
    const router = useRouter();

    // save expanded state from localStorage on component mount
    useEffect(() => {
        const storedState = localStorage.getItem("expandedFolders");
        if (storedState) {
            setExpanded(JSON.parse(storedState));
        }
    }, []);

    const toggleExpand = (id) => {
        setExpanded((prev) => {
            const newExpanded = {
                ...prev,
                [id]: !prev[id], // Toggle expand state
            };
            localStorage.setItem("expandedFolders", JSON.stringify(newExpanded)); // Save to localStorage
            return newExpanded;
        });
    };

    return (
        <ul className="text-sm ml-2 border-l">
            {nodes.map((node) => (
                <div key={node.id} className="mt-1">
                    <div
                        className="flex items-center cursor-pointer"
                    >
                        <span className="mr-2" onClick={() => toggleExpand(node.id)}>
                            {expanded[node.id] ? <ChevronDown size="16" /> : <ChevronRight size="16" />}
                        </span>
                        <span>
                            {expanded[node.id] ? <FolderOpen size="16" /> : <Folder size="16" />}
                        </span>
                        <span className="ml-2 text-nowrap" onClick={(event) => {
                            console.log(node);
                            router.push(node.url);
                            event.stopPropagation();
                        }}>
                            {node.name}
                        </span>
                    </div>

                    {expanded[node.id] && node.children.length > 0 && (
                        <FolderTreeView nodes={node.children} />
                    )}
                </div>

            ))}
        </ul>
    );
};

// main render component
const FolderTree = () => {
    const [folders, setFolders] = useState([]);
    const router = useRouter();

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
        <div>
            <FolderTreeView nodes={folders} />
        </div>
    );
};

export default FolderTree;