import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, isGuest: boolean): string {
  return jwt.sign({ userId, isGuest }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; isGuest: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; isGuest: boolean };
  } catch {
    return null;
  }
}
