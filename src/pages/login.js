import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(username + " " + password);
        // Basic input validation
        if (!username || !password) {
            alert('Please fill in all fields.');
            return;
        }
        try {
            // Axios POST request to login API
            await axios.post('/api/user/login', { username, password });

            // Redirect to root
            router.push('/');
        } catch (error) {
            // Handle error response
            if (error.response) {
                // Server responded with a status other than 2xx
                alert(error.response.data.message || 'Invalid login credentials.');
            } else {
                // Network error or other issues
                console.error('Login error:', error);
                alert('An error occurred. Please try again.');
            }
        }

    }

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem', textAlign: 'center' }}>
            <h1>Login</h1>

            <form>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button onClick={handleLogin} style={{ padding: '0.5rem 1rem' }}>
                    Login
                </button>
            </form>
        </div>
    );

}