import { Folder, Settings, ArrowLeftFromLine, ChevronDown, ChevronUp } from "lucide-react"

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

import { Button } from "./ui/button"

import { useRouter } from "next/router"
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from 'react'
import axios from "axios";

export function AppSidebar() {
    const router = useRouter();
    const { authData, setAuthData } = useAuth();
    const [hierarchy, setHierarchy] = useState();

    const handleSignOut = async () => {
        try {

            await axios.post('/api/user/logout');
            router.reload();

        } catch (error) {

            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');

        }
    };

    // Component to render the folder hierarchy
    const FolderTree = ({ tree = [] }) => (
        <ul>
            {tree.map(folder => (
                <li key={folder.id} className="p-4">
                    {folder.name}
                    {folder.children.length > 0 && <FolderTree tree={folder.children} />}
                </li>
            ))}
        </ul>
    );

    const getHierarchy = async () => {
        const response = await axios.get('/api/file/hierarchy');

        const folders = response.data.allFolders;
        const folderMap = {};
        const rootFolders = [];

        // Create mapping of folder IDs and initialize children array
        folders.forEach(folder => {
            folderMap[folder.id] = { ...folder, children: [] };
        });

        // Build the tree structure iteratively
        folders.forEach(folder => {
            if (folder.parent_id === 'root') {
                rootFolders.push(folderMap[folder.id]);
            } else if (folderMap[folder.parent_id]) {
                folderMap[folder.parent_id].children.push(folderMap[folder.id]);
            }
        });

        console.log(rootFolders);
        setHierarchy(rootFolders);
    }

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
                <div>
                    <h1>Folder Hierarchy</h1>
                    <FolderTree tree={hierarchy} />
                </div>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => { handleSignOut() }} className="hover:bg-red-600 hover:text-white">
                            Sign out
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

    )
}
