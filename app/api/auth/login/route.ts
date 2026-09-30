import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { comparePassword, signToken, COOKIE_NAME, DEFAULT_USERS } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('ایمیل و رمز عبور الزامی است', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    let userRecord: any = null;

    // Try Supabase first
    try {
      const client = supabase.client;
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        userRecord = data;
      }
    } catch {
      // Fallback
    }

    // Fallback to default users if not found in DB
    if (!userRecord) {
      userRecord = DEFAULT_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!userRecord) {
      return errorResponse('کاربری با این ایمیل یافت نشد', 401);
    }

    const isMatch = await comparePassword(password, userRecord.password_hash);
    if (!isMatch) {
      return errorResponse('رمز عبور وارد شده نادرست است', 401);
    }

    const sessionPayload = {
      id: userRecord.id,
      email: userRecord.email,
      full_name: userRecord.full_name,
      role: userRecord.role || 'member',
      avatar_url: userRecord.avatar_url || null,
    };

    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      data: sessionPayload,
      message: 'ورود موفقیت‌آمیز بود',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در فرآیند ورود', 500);
  }
}
