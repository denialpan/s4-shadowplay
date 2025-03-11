import { Folder, Settings, ArrowLeftFromLine, ChevronDown, ChevronUp, FilePen } from "lucide-react"
import folderTree from "./folderHierharchy/folderTree"
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
import FolderTreeView from "./folderHierharchy/folderTree"
import FolderTree from "./folderHierharchy/folderTree"
import { useSidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
    const router = useRouter();
    const { setOpenMobile } = useSidebar();
    const { authData, setAuthData } = useAuth();

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

    return (
        <Sidebar>
            <SidebarHeader >
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarGroupLabel>
                            <span className="mr-1 cursor-pointer" onClick={() => { router.push("/"); setOpenMobile(false) }}> Home </span>  | s4-shadowplay | {authData.username}
                        </SidebarGroupLabel>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent >
                <SidebarMenu>

                    <FolderTree></FolderTree>

                </SidebarMenu>

            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <div className="flex flex-col p-2 bg-zinc-200 justify-center whitespace-nowrap rounded-md text-sm font-medium dark:bg-zinc-800 dark:text-zinc-400">
                        <p className="text-xs">
                            Files: {fileStats.length}
                        </p>
                        <p className="text-xs">
                            Folders: {folderStats.length}
                        </p>
                        <p className="text-xs">
                            Total Size: {formatFileSize(Object.values(fileStats || {}).reduce((total, file) => total + (file.size || 0), 0))}
                        </p>
                    </div>

                    <SidebarMenuButton onClick={() => { handleSignOut() }} className="hover:bg-red-600 hover:text-white font-semibold">
                        Sign Out
                    </SidebarMenuButton>

                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

    )
}
