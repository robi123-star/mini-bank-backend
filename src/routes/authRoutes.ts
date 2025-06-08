import express from 'express';
import jwt from 'jsonwebtoken';
import { ADMIN_CREDENTIALS } from '../config'; // Ensure this path is correct

const router = express.Router();

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if the provided credentials match the admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Generate JWT token
        const accessToken = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ accessToken });
    }

    return res.status(400).json({ error: 'Invalid credentials' });
});

export default router;
