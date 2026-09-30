import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEFAULT_USERS, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, new_password } = body;

    if (!email) {
      return errorResponse('ایمیل الزامی است', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    let userRecord: any = null;

    try {
      const client = supabase.client;
      const { data } = await client
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data) userRecord = data;
    } catch {
      // Fallback
    }

    if (!userRecord) {
      userRecord = DEFAULT_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!userRecord) {
      return errorResponse('حساب کاربری با این ایمیل یافت نشد', 404);
    }

    // If new_password provided, reset immediately
    if (new_password) {
      if (new_password.length < 6) {
        return errorResponse('رمز عبور جدید باید حداقل ۶ کاراکتر باشد', 400);
      }
      const newHash = await hashPassword(new_password);
      try {
        const client = supabase.client;
        await client
          .from('profiles')
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq('email', cleanEmail);
      } catch {
        userRecord.password_hash = newHash;
      }
      return successResponse({ message: 'رمز عبور شما با موفقیت بازنشانی شد' });
    }

    return successResponse({
      message: 'درخواست بازنشانی رمز عبور تأیید شد. لطفاً رمز جدید را وارد نمایید.',
      verified: true,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در بازنشانی رمز عبور', 500);
  }
}
