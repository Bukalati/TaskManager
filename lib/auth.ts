import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export interface StoredUser extends UserSession {
  password_hash: string;
}

// Default seeded accounts
export const DEFAULT_USERS: StoredUser[] = [
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

const DATA_DIR = path.join(process.cwd(), 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
let inMemoryUsers: StoredUser[] | null = null;

export function getAllStoredUsers(): StoredUser[] {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryUsers = parsed;
        return inMemoryUsers;
      }
    }
  } catch {}

  if (inMemoryUsers && inMemoryUsers.length > 0) {
    return inMemoryUsers;
  }

  inMemoryUsers = [...DEFAULT_USERS];
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(inMemoryUsers, null, 2), 'utf-8');
  } catch {}

  return inMemoryUsers;
}

export function saveStoredUser(user: Partial<StoredUser> & { id: string }): StoredUser {
  const users = getAllStoredUsers();
  const index = users.findIndex((u) => u.id === user.id);

  let updated: StoredUser;
  if (index >= 0) {
    updated = { ...users[index], ...user };
    users[index] = updated;
  } else {
    updated = user as StoredUser;
    users.push(updated);
  }

  inMemoryUsers = users;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {}

  return updated;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = getAllStoredUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  const users = getAllStoredUsers();
  return users.find((u) => u.id === id);
}

// Hash plain password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare plain password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign JWT token - Keep token small so it NEVER exceeds the 4096-byte cookie limit
export async function signToken(payload: UserSession): Promise<string> {
  // If avatar_url is long (base64 data URL), omit from JWT cookie payload
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    full_name: payload.full_name,
    role: payload.role,
    avatar_url: payload.avatar_url && payload.avatar_url.length < 200 ? payload.avatar_url : null,
  };

  return new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify JWT token & populate latest user profile from storage
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;
    const stored = findUserById(userId);

    return {
      id: userId,
      email: (stored?.email || payload.email) as string,
      full_name: (stored?.full_name || payload.full_name) as string,
      role: (stored?.role || payload.role || 'member') as 'admin' | 'member',
      avatar_url: stored?.avatar_url || (payload.avatar_url as string) || null,
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
