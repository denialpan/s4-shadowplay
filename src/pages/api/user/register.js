import argon2 from 'argon2';
import { connectFileSystem } from '../../../../database/connect';

export default async function handler(req, res) {

    if (req.method === 'POST') {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const db = connectFileSystem();

        try {
            // Hash the password using Argon2
            const hashedPassword = await argon2.hash(password);

            // Insert the user into the database
            db.run(
                `INSERT INTO users (username, password) VALUES (?, ?)`,
                [username, hashedPassword],
                function (err) {
                    if (err) {
                        if (err.message.includes("UNIQUE constraint failed")) {
                            return res.status(400).json({ error: 'Username already exists.' });
                        }
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error.' });
                    }

                    res.status(201).json({ message: 'User registered successfully.' });
                }
            );
        } finally {
            db.close(); // Always close the database connection
        }

    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}