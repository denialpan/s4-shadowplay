export default function handler(req, res) {
    if (req.method === 'POST') {
        // Clear the HTTP-only cookie
        res.setHeader(
            'Set-Cookie',
            'authToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict'
        );
        res.status(200).json({ message: 'Signed out successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
