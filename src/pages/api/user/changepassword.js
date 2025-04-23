import argon2 from 'argon2';
import { connectFileSystem } from '../../../../database/connect';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'New passwords do not match.' });
    }

    // Get username from auth token
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    let username;
    try {
        const { payload } = await jwtVerify(token, secret);
        username = payload.username;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    const db = connectFileSystem();

    try {
        const user = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const passwordMatch = await argon2.verify(user.password, currentPassword);
        if (!passwordMatch) {
            return res.status(403).json({ error: 'Current password is incorrect.' });
        }

        const hashedPassword = await argon2.hash(newPassword);

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET password = ? WHERE username = ?`,
                [hashedPassword, username],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Optional: log user out by clearing cookie
        res.setHeader('Set-Cookie', `authToken=; HttpOnly; Path=/; Max-Age=0`);

        return res.status(200).json({ message: 'Password updated. Please log in again.' });
    } catch (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ error: 'Server error.' });
    } finally {
        db.close();
    }
}
