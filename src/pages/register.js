import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function RegisterPage() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            // Axios POST request to register API
            const response = await axios.post('/api/user/register', {
                username,
                password,
            });

            alert(response.data.message || 'Registration successful! Please log in.');
            router.push('/login'); // Redirect to login page after registration
        } catch (error) {
            if (error.response) {
                // Server responded with an error
                alert(error.response.data.message || 'Registration failed.');
            } else {
                console.error('Registration error:', error);
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem', textAlign: 'center' }}>
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
                <button onClick={handleRegister} style={{ padding: '0.5rem 1rem' }}>
                    Register
                </button>
            </form>
        </div>
    );

}