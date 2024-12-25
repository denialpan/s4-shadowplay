import { Folder, Settings, ArrowLeftFromLine } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/authContext";
import axios from "axios";

// Menu items.
const items = [
    {
        title: "root /",
        url: "/",
        icon: Folder,
    },
    {
        title: "Settings",
        url: "/sohos",
        icon: Settings,
    },
]


export function AppSidebar() {
    const router = useRouter();
    const { authData, setAuthData } = useAuth();

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
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>s4-shadowplay | {authData.username}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <div className="hover:cursor-pointer" onClick={() => { router.push(item.url) }}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </div>

                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem key="signout">
                                <SidebarMenuButton asChild>
                                    <div className="hover:bg-red-600 cursor-pointer" onClick={handleSignOut}>
                                        <ArrowLeftFromLine />
                                        <span>Sign out</span>

                                    </div>

                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
