"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string(),
});
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';
// Simple in-memory store for refresh tokens — for demonstration only
const refreshTokensStore = new Set();
async function login(req, res) {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid email or password format' });
        }
        const { email, password } = parseResult.data;
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const validPassword = await bcrypt_1.default.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const accessToken = jsonwebtoken_1.default.sign({ adminId: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ adminId: admin.id, email: admin.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        refreshTokensStore.add(refreshToken);
        return res.json({ accessToken, refreshToken });
    }
    catch {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function refreshToken(req, res) {
    try {
        const parseResult = refreshTokenSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid refresh token format' });
        }
        const { refreshToken } = parseResult.data;
        if (!refreshTokensStore.has(refreshToken)) {
            return res.status(403).json({ error: 'Refresh token invalid or expired' });
        }
        jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Refresh token invalid or expired' });
            }
            const newAccessToken = jsonwebtoken_1.default.sign({ adminId: user.adminId, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
            return res.json({ accessToken: newAccessToken });
        });
    }
    catch {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function logout(req, res) {
    try {
        const parseResult = refreshTokenSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Refresh token required' });
        }
        const { refreshToken } = parseResult.data;
        refreshTokensStore.delete(refreshToken);
        return res.status(204).send();
    }
    catch {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
