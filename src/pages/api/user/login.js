import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { connectUser } from '../../../../database/connect';

const JWT_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {

    if (req.method === 'POST') {
        const { username, password } = req.body;

        console.log(username);
        console.log(password);

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const db = connectUser();

        try {
            const user = await new Promise((resolve, reject) => {
                db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            const isValid = await argon2.verify(user.password, password);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, JWT_KEY, {
                expiresIn: '1h',
            });

            res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=3600`);
            return res.status(200).json({ message: 'Login successful' });
        } catch (error) {
            console.error('Error occurred:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        } finally {
            db.close();
        }

    }
}