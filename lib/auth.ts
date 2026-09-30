import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'taskflow-super-secret-key-neo-brutalist-2026-very-secure'
);

export const COOKIE_NAME = 'taskflow_session';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member';
  avatar_url?: string | null;
}

// Fallback in-memory users in case Supabase schema.sql hasn't been run yet
export const DEFAULT_USERS: Array<UserSession & { password_hash: string }> = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@taskflow.local',
    password_hash: '$2b$10$Aq32jNuxRikaxBWX1.xmQ.lz74QkEEkLZkyUok3pfr0TCXZz1KcTK', // Admin@123456
    full_name: 'مدیر سیستم (Super Admin)',
    role: 'admin',
    avatar_url: null,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    email: 'sara@taskflow.local',
    password_hash: '$2b$10$/D1.XUtSb72H4zg9Wexs1OeYvLEoKUtdox8N5JgtFDTou4Ob24Xvq', // Sara@123456
    full_name: 'سارا محمدی',
    role: 'member',
    avatar_url: null,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    email: 'ali@taskflow.local',
    password_hash: '$2b$10$W90dRgVqUbKd/56XxlzscuL32tVWJD8vyhtmbEXhj2V3/J5cS6wKu', // Ali@123456
    full_name: 'علی کریمی',
    role: 'member',
    avatar_url: null,
  },
];

// Hash plain password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare plain password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign JWT token
export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      full_name: payload.full_name as string,
      role: (payload.role as 'admin' | 'member') || 'member',
      avatar_url: (payload.avatar_url as string) || null,
    };
  } catch {
    return null;
  }
}

// Read current user from cookie in API route or Server Component
export async function getSessionUser(req?: NextRequest): Promise<UserSession | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    }

    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
