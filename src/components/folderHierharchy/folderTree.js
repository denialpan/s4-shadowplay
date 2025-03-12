import { useRouter } from "next/router"
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from 'react'
import { Folder, Settings, ArrowLeftFromLine, ChevronDown, ChevronRight, FilePen, FolderOpen } from "lucide-react"
import { Button } from "../ui/button";
import axios from "axios";
import { ScrollBar, ScrollArea } from "../ui/scroll-area";
import { useSidebar } from "../ui/sidebar";
import { useRefresh } from "@/utils/refreshContent";

const buildFolderTree = (folders, options) => {

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
const FolderTreeView = ({ nodes, redirect, onSelect, selectedNode, currentDirectoryId }) => {
    const [expanded, setExpanded] = useState({});
    const router = useRouter();
    const { setOpenMobile } = useSidebar();

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
                [id]: !prev[id],
            };
            localStorage.setItem("expandedFolders", JSON.stringify(newExpanded));
            return newExpanded;
        });
    };

    return (
        <ul className="text-sm ml-2 border-l">
            {nodes
                .filter(node => node.id !== currentDirectoryId && currentDirectoryId !== "root")
                .map((node) => (
                    <div key={node.id} className={`mt-1 `}>
                        <div
                            className={`flex items-center cursor-pointer ${!redirect && selectedNode === node.id ? "bg-gray-300 dark:bg-gray-700" : ""
                                }`}
                        >
                            <span className="mr-2" onClick={() => toggleExpand(node.id)}>
                                {expanded[node.id] ? <ChevronDown size="16" /> : <ChevronRight size="16" />}
                            </span>
                            <span>
                                {expanded[node.id] ? <FolderOpen size="16" /> : <Folder size="16" />}
                            </span>
                            <span className="ml-2 text-nowrap" onClick={(event) => {
                                if (node.url && redirect) {
                                    router.push(node.url);
                                } else {
                                    console.log(currentDirectoryId);
                                    onSelect(node.id);
                                }

                                setOpenMobile(false);
                                event.stopPropagation();
                            }}>
                                {node.name}
                            </span>
                        </div>

                        {expanded[node.id] && node.children.length > 0 && (
                            <FolderTreeView nodes={node.children} redirect={redirect} onSelect={onSelect} selectedNode={selectedNode} currentDirectoryId={currentDirectoryId} />
                        )}
                    </div>

                ))}
        </ul>
    );
};

// main render component
const FolderTree = ({ redirect, onSelect, selectedNode, currentDirectoryId }) => {
    const [folders, setFolders] = useState([]);
    const router = useRouter();
    const { refreshCounter, triggerRefresh } = useRefresh(); // Get refresh state

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
    }, [refreshCounter]);

    return (
        <div className="custom-scrollbar">
            {!redirect && (
                <div className="text-sm ml-2 flex cursor-pointer" onClick={() => { onSelect("root") }}>
                    <span>
                        <FolderOpen size="16" />
                    </span>
                    <span className="ml-2">
                        Root Home Directory /
                    </span>
                </div>
            )}
            <FolderTreeView nodes={folders} redirect={redirect} onSelect={onSelect} selectedNode={selectedNode} currentDirectoryId={currentDirectoryId} />
        </div>
    );
};

export default FolderTree;