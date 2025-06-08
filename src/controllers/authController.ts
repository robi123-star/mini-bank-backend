import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';

// Simple in-memory store for refresh tokens — for demonstration only
const refreshTokensStore = new Set<string>();

export async function login(req: Request, res: Response) {
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
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = jwt.sign({ adminId: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ adminId: admin.id, email: admin.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    refreshTokensStore.add(refreshToken);

    return res.json({ accessToken, refreshToken });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const parseResult = refreshTokenSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid refresh token format' });
    }
    const { refreshToken } = parseResult.data;
    if (!refreshTokensStore.has(refreshToken)) {
      return res.status(403).json({ error: 'Refresh token invalid or expired' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Refresh token invalid or expired' });
      }
      const newAccessToken = jwt.sign({ adminId: user.adminId, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
      return res.json({ accessToken: newAccessToken });
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const parseResult = refreshTokenSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    const { refreshToken } = parseResult.data;
    refreshTokensStore.delete(refreshToken);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
