import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

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

// Synchronous fallback reader
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
  return inMemoryUsers;
}

// Asynchronous reader that fetches and syncs with Supabase cloud database
export async function getAllStoredUsersAsync(): Promise<StoredUser[]> {
  const usersMap = new Map<string, StoredUser>();

  // 1. Seed defaults
  for (const def of DEFAULT_USERS) {
    usersMap.set(def.id, { ...def });
  }

  // 2. Load from local profiles.json if exists
  for (const loc of getAllStoredUsers()) {
    usersMap.set(loc.id, { ...loc });
  }

  // 3. Fetch from Supabase tasks table (__USER__:<email> rows)
  try {
    const client = supabase.client;
    const { data, error } = await client
      .from('tasks')
      .select('id, title, description')
      .like('title', '__USER__:%');

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        try {
          if (row.description) {
            const userObj = JSON.parse(row.description) as StoredUser;
            if (userObj.id && userObj.email) {
              usersMap.set(userObj.id, userObj);
            }
          }
        } catch {}
      }
    }
  } catch {}

  // 4. Also check if profiles table exists in Supabase
  try {
    const client = supabase.client;
    const { data, error } = await client.from('profiles').select('*');

    if (!error && Array.isArray(data)) {
      for (const p of data) {
        if (p.id) {
          const existing = usersMap.get(p.id) || ({} as StoredUser);
          usersMap.set(p.id, {
            ...existing,
            ...p,
            id: p.id,
            email: p.email || existing.email,
            full_name: p.full_name || existing.full_name,
            role: p.role || existing.role || 'member',
            avatar_url: p.avatar_url ?? existing.avatar_url ?? null,
            password_hash: p.password_hash || existing.password_hash || '',
          });
        }
      }
    }
  } catch {}

  const merged = Array.from(usersMap.values());
  inMemoryUsers = merged;
  return merged;
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

export async function saveStoredUserAsync(user: Partial<StoredUser> & { id: string }): Promise<StoredUser> {
  const updated = saveStoredUser(user);

  let fullUser = updated;
  if (!fullUser.email) {
    const existing = (await findUserByIdAsync(user.id)) || findUserById(user.id);
    if (existing) {
      fullUser = { ...existing, ...updated };
    }
  }

  if (fullUser.id && fullUser.email) {
    // Upsert into Supabase tasks table
    try {
      const client = supabase.client;
      await client.from('tasks').upsert({
        id: fullUser.id,
        title: '__USER__:' + fullUser.email.toLowerCase(),
        description: JSON.stringify(fullUser),
        status: 'TODO',
        priority: 'LOW',
        updated_at: new Date().toISOString(),
      });
    } catch {}

    // Also try profiles table if it exists
    try {
      const client = supabase.client;
      await client.from('profiles').upsert([fullUser]);
    } catch {}
  }

  return fullUser;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = getAllStoredUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export async function findUserByEmailAsync(email: string): Promise<StoredUser | undefined> {
  const cleanEmail = email.trim().toLowerCase();

  // Try direct Supabase query first
  try {
    const client = supabase.client;
    const { data } = await client
      .from('tasks')
      .select('id, title, description')
      .eq('title', '__USER__:' + cleanEmail)
      .maybeSingle();

    if (data?.description) {
      const parsed = JSON.parse(data.description) as StoredUser;
      if (parsed.email) {
        saveStoredUser(parsed);
        return parsed;
      }
    }
  } catch {}

  // Also try profiles table
  try {
    const client = supabase.client;
    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (data?.email) {
      saveStoredUser(data);
      return data;
    }
  } catch {}

  // Fallback to all stored users async
  const all = await getAllStoredUsersAsync();
  return all.find((u) => u.email.toLowerCase() === cleanEmail);
}

export function findUserById(id: string): StoredUser | undefined {
  const users = getAllStoredUsers();
  return users.find((u) => u.id === id);
}

export async function findUserByIdAsync(id: string): Promise<StoredUser | undefined> {
  // Try direct Supabase query
  try {
    const client = supabase.client;
    const { data } = await client
      .from('tasks')
      .select('id, title, description')
      .eq('id', id)
      .like('title', '__USER__:%')
      .maybeSingle();

    if (data?.description) {
      const parsed = JSON.parse(data.description) as StoredUser;
      if (parsed.id) {
        saveStoredUser(parsed);
        return parsed;
      }
    }
  } catch {}

  // Try profiles table
  try {
    const client = supabase.client;
    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data?.id) {
      saveStoredUser(data);
      return data;
    }
  } catch {}

  const all = await getAllStoredUsersAsync();
  return all.find((u) => u.id === id);
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
    const stored = (await findUserByIdAsync(userId)) || findUserById(userId);

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
