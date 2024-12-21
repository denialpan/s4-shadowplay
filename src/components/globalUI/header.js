import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/authContext";

const Header = () => {

    const router = useRouter();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

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
            {isAuthenticated && <button onClick={handleSignOut}> SIGN OUT </button>}
        </div>
    )

}

export default Header;