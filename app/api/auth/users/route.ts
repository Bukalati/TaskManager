import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllStoredUsers } from '@/lib/auth';
import { errorResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    // 1. Load all stored users (local JSON / in-memory)
    const storedUsers = getAllStoredUsers().map(({ password_hash, ...u }) => u);
    const usersMap = new Map<string, any>();

    for (const u of storedUsers) {
      if (u.id) usersMap.set(u.id, u);
    }

    // 2. Try fetching fresh profiles from Supabase if table exists
    try {
      const client = supabase.client;
      const { data, error } = await client
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, created_at')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        for (const p of data) {
          const existing = usersMap.get(p.id);
          if (existing) {
            usersMap.set(p.id, { ...existing, ...p });
          } else {
            usersMap.set(p.id, p);
          }
        }
      }
    } catch {
      // Supabase table does not exist or unavailable
    }

    const allUsers = Array.from(usersMap.values());

    const response = NextResponse.json({
      success: true,
      data: allUsers,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در دریافت لیست کاربران', 500);
  }
}

