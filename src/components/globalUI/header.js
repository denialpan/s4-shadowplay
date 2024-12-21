import axios from "axios";
import { useRouter } from "next/router";

const Header = () => {

    const router = useRouter();

    const handleSignOut = async () => {
        try {
            // clear cookie
            await axios.post('/api/user/logout');
            router.push('/login');

        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    };

    return (
        <div>
            s4-shadowplay

            <button onClick={handleSignOut}> SIGN OUT </button>
        </div>
    )

}

export default Header;