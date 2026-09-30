import { NextRequest } from 'next/server';
import { getSessionUser, comparePassword, hashPassword, findUserById, saveStoredUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('احراز هویت نشده‌اید', 401);
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return errorResponse('رمز عبور فعلی و رمز عبور جدید الزامی هستند', 400);
    }

    if (new_password.length < 6) {
      return errorResponse('رمز عبور جدید باید حداقل ۶ کاراکتر باشد', 400);
    }

    let userRecord: any = null;

    try {
      const client = supabase.client;
      const { data } = await client
        .from('profiles')
        .select('*')
        .eq('id', session.id)
        .maybeSingle();

      if (data) userRecord = data;
    } catch {
      // Fallback
    }

    if (!userRecord) {
      userRecord = findUserById(session.id);
    }

    if (!userRecord) {
      return errorResponse('کاربر یافت نشد', 404);
    }

    const isMatch = await comparePassword(current_password, userRecord.password_hash);
    if (!isMatch) {
      return errorResponse('رمز عبور فعلی نادرست است', 400);
    }

    const newHash = await hashPassword(new_password);

    try {
      const client = supabase.client;
      await client
        .from('profiles')
        .update({
          password_hash: newHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);
    } catch {
      // Fallback
    }

    saveStoredUser({ id: session.id, password_hash: newHash });

    return successResponse(
      { message: 'رمز عبور با موفقیت تغییر کرد' },
      200,
      undefined,
      'رمز عبور با موفقیت تغییر کرد'
    );
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در تغییر رمز عبور', 500);
  }
}
