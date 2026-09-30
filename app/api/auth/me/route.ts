import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('احراز هویت نشده‌اید', 401);
    }

    // Try fetching fresh data from Supabase
    let freshUser = session;
    try {
      const client = supabase.client;
      const { data } = await client
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', session.id)
        .maybeSingle();

      if (data) {
        freshUser = data;
      }
    } catch {
      // Use token session
    }

    return successResponse(freshUser);
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در بررسی سشن', 500);
  }
}
