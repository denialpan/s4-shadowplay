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

        db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // Compare the provided password with the hashed password
            const isValid = await argon2.verify(user.password, password);

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // Generate a JWT
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_KEY, {
                expiresIn: '1h',
            });

            // Set the JWT in an HTTP-only cookie
            res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=3600`);

            res.status(200).json({ message: 'Login successful' });
        });

        db.close();

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}