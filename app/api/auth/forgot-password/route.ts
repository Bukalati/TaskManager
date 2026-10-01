import { NextRequest } from 'next/server';
import { hashPassword, findUserByEmailAsync, saveStoredUserAsync, cleanEmailAddress, normalizeDigits } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, new_password } = body;

    if (!email) {
      return errorResponse('ایمیل الزامی است', 400);
    }

    const cleanEmail = cleanEmailAddress(email);
    const userRecord = await findUserByEmailAsync(cleanEmail);

    if (!userRecord) {
      return errorResponse('حساب کاربری با این ایمیل یافت نشد', 404);
    }

    // If new_password provided, reset immediately
    if (new_password) {
      const cleanPass = normalizeDigits(new_password);
      if (cleanPass.length < 6) {
        return errorResponse('رمز عبور جدید باید حداقل ۶ کاراکتر باشد', 400);
      }
      const newHash = await hashPassword(cleanPass);
      await saveStoredUserAsync({ id: userRecord.id, password_hash: newHash });
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
