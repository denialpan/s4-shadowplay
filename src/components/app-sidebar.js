import { Folder, Settings, ArrowLeftFromLine, ChevronDown, ChevronUp, FilePen } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { Button } from "./ui/button"

import { useRouter } from "next/router"
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from 'react'
import axios from "axios";

export function AppSidebar() {
    const router = useRouter();
    const { authData, setAuthData } = useAuth();
    const [hierarchy, setHierarchy] = useState({});
    const [fileStats, setFileStats] = useState({});
    const [folderStats, setFolderStats] = useState({});

    const formatFileSize = (size) => {
        if (size < 1024) return `${size} B`;
        const i = Math.floor(Math.log(size) / Math.log(1024));
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const handleSignOut = async () => {
        try {

            await axios.post('/api/user/logout');
            router.reload();

        } catch (error) {

            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');

        }
    };



    const getHierarchy = async () => {
        const response = await axios.get('/api/file/hierarchy');

        const folders = response.data.allFolders;

        setFileStats(response.data.allFiles);
        setFolderStats(response.data.allFolders);

        const folderMap = {};

        // Initialize each folder with a `children` array
        folders.forEach(folder => {
            folderMap[folder.id] = { ...folder, children: [] };
        });

        // Step 2: Build the hierarchy
        const rootFolders = {};

        folders.forEach(folder => {
            if (folder.parent_id === 'root') {
                // Root folder: Add it to the rootFolders object
                rootFolders[folder.id] = folderMap[folder.id];
            } else {
                // Child folder: Add it to its parent's `children` array
                const parentFolder = folderMap[folder.parent_id];
                if (parentFolder) {
                    parentFolder.children.push(folderMap[folder.id]);
                }
            }
        });

        // Iteratively append URLs
        const queue = [];

        // Start with root folders and assign initial URLs
        Object.values(rootFolders).forEach(rootFolder => {
            rootFolder.url = `/folder/${rootFolder.name}`;
            queue.push(rootFolder);
        });

        // Process each folder in the queue
        while (queue.length > 0) {
            const currentFolder = queue.shift(); // Dequeue the first folder

            currentFolder.children.forEach(childFolder => {
                // Compute the URL for the child folder
                childFolder.url = `${currentFolder.url}/${childFolder.name}`;

                // Add the child folder to the queue for further processing
                queue.push(childFolder);
            });
        }

        setHierarchy(rootFolders);
    }

    const FolderTree = ({ tree }) => {
        const [accordionState, setAccordionState] = useState({});

        useEffect(() => {
            // Load accordion state from localStorage on mount
            const savedState = localStorage.getItem("accordionState");
            if (savedState) {
                setAccordionState(JSON.parse(savedState));
            }
        }, []);

        const handleAccordionChange = (folderId, isOpen) => {
            // Update the accordion state
            const newState = { ...accordionState, [folderId]: isOpen };
            setAccordionState(newState);

            // Save updated state to localStorage
            localStorage.setItem("accordionState", JSON.stringify(newState));
        };

        const router = useRouter();

        return (
            <div>
                {tree.map(folder => (
                    <Accordion
                        type="single"
                        collapsible
                        key={folder.id}
                        className="ml-2 pl-1 border-l-2"
                        value={accordionState[folder.id] ? "item-1" : undefined} // Control open state
                        onValueChange={(value) => handleAccordionChange(folder.id, value === "item-1")}
                    >
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div
                                    className="flex flex-row items-center gap-1 text-nowrap"
                                    onClick={(event) => {
                                        router.push(folder.url);
                                        event.stopPropagation();
                                    }}
                                >
                                    <Folder size="16" />
                                    {folder.name}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {folder.children.length > 0 && <FolderTree tree={folder.children} />}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
            </div>
        );
    };

    useEffect(() => {
        getHierarchy();
    }, [router.pathname])

    return (
        <Sidebar>
            <SidebarHeader >
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarGroupLabel>
                            s4-shadowplay | {authData.username}
                        </SidebarGroupLabel>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent >
                <SidebarMenu>

                    <div className="m-2 pl-1 rounded-md dark:bg-zinc-800">
                        <Accordion type="single" collapsible key="root" className="pl-1">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    <div className="" onClick={(event) => {
                                        router.push('/');
                                        event.stopPropagation();
                                    }}>
                                        root
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <FolderTree tree={Object.values(hierarchy)} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                    </div>
                </SidebarMenu>



            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <div className="flex flex-col p-2 bg-zinc-200 justify-center whitespace-nowrap rounded-md text-sm font-medium dark:bg-zinc-800 dark:text-zinc-400">
                        <div>
                            Files: {fileStats.length}
                        </div>
                        <div>
                            Folders: {folderStats.length}
                        </div>
                        <div>
                            Total Size: {formatFileSize(Object.values(fileStats || {}).reduce((total, file) => total + (file.size || 0), 0))}
                        </div>
                    </div>

                    <SidebarMenuButton onClick={() => { handleSignOut() }} className="hover:bg-red-600 hover:text-white">
                        Sign out
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

    )
}
