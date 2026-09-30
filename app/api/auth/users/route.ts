import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser, DEFAULT_USERS } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('احراز هویت نشده‌اید', 401);
    }

    let usersList: any[] = [];

    try {
      const client = supabase.client;
      const { data, error } = await client
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, created_at')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        usersList = data;
      }
    } catch {
      // Fallback
    }

    if (usersList.length === 0) {
      usersList = DEFAULT_USERS.map(({ password_hash, ...u }) => u);
    }

    return successResponse(usersList);
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در دریافت لیست کاربران', 500);
  }
}
