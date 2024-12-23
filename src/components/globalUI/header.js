import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/authContext";
import { Moon, MoonIcon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = () => {

    const router = useRouter();
    const { authData, setAuthData } = useAuth();
    const { theme, setTheme } = useTheme();

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
        <div>
            s4-shadowplay


            {authData.isAuthenticated && <Button variant="destructive" onClick={handleSignOut}> SIGN OUT {authData.username}</Button>}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

}

export default Header;