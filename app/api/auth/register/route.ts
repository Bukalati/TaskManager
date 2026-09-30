import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, signToken, COOKIE_NAME, findUserByEmailAsync, saveStoredUserAsync } from '@/lib/auth';
import { errorResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return errorResponse('تمام فیلدها (نام، ایمیل و رمز عبور) الزامی هستند', 400);
    }

    if (password.length < 6) {
      return errorResponse('رمز عبور باید حداقل ۶ کاراکتر باشد', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = full_name.trim();

    // Check if email already registered
    const existingUser = await findUserByEmailAsync(cleanEmail);
    if (existingUser) {
      return errorResponse('کاربری با این ایمیل قبلاً ثبت نام کرده است', 409);
    }

    const password_hash = await hashPassword(password);
    const newUserId = crypto.randomUUID();
    const role: 'member' = 'member';

    const newProfile = {
      id: newUserId,
      email: cleanEmail,
      full_name: cleanName,
      password_hash,
      role,
      avatar_url: null,
    };

    // Persist in cloud database & local store
    await saveStoredUserAsync(newProfile);

    const sessionPayload = {
      id: newUserId,
      email: cleanEmail,
      full_name: cleanName,
      role: 'member' as const,
      avatar_url: null,
    };

    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      data: sessionPayload,
      message: 'ثبت‌نام با موفقیت انجام شد',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در فرآیند ثبت‌نام', 500);
  }
}
