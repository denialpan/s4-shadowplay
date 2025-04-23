import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function RegisterPage() {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const router = useRouter();

    const handleConfirm = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Please fill in all fields.');
            return;
        }



        // Axios POST request to register API
        await axios.post('/api/user/changepassword', {
            currentPassword,
            newPassword,
            confirmNewPassword,
        }).then((response) => {
            alert(response.data.message || 'Change password successful! Please log in.');
            router.push('/login'); // Redirect to login page after registration
        }).catch(function (error) {
            if (error.response) {
                console.error('Change password error:', error);
                alert('An error occurred. Please try again.');
            }
        })


    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem', textAlign: 'center' }}>
            <form>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button onClick={handleConfirm} style={{ padding: '0.5rem 1rem' }}>
                    Submit
                </button>
            </form>
        </div>
    );

}