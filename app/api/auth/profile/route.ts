import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, signToken, COOKIE_NAME, saveStoredUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('احراز هویت نشده‌اید', 401);
    }

    const body = await request.json();
    const { full_name, avatar_url } = body;

    const updatedUser = {
      ...session,
      full_name: full_name?.trim() || session.full_name,
      avatar_url: avatar_url !== undefined ? avatar_url : session.avatar_url,
    };

    // Save in file-based & in-memory store
    saveStoredUser(updatedUser);

    // Update in Supabase if table exists
    try {
      const client = supabase.client;
      await client
        .from('profiles')
        .update({
          full_name: updatedUser.full_name,
          avatar_url: updatedUser.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);
    } catch {
      // Ignored if table not created yet
    }

    // Refresh cookie safely
    const token = await signToken(updatedUser);
    const response = NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'پروفایل با موفقیت بروزرسانی شد',
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
    return errorResponse(err.message || 'خطا در ویرایش پروفایل', 500);
  }
}
