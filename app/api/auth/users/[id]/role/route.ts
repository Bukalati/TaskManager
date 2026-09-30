import { NextRequest } from 'next/server';
import { getSessionUser, saveStoredUserAsync } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('احراز هویت نشده‌اید', 401);
    }

    if (session.role !== 'admin') {
      return errorResponse('فقط مدیر ارشد سیستم اجازه تغییر نقش‌ها را دارد', 403);
    }

    const { id: targetUserId } = await params;
    const body = await request.json();
    const { role } = body;

    if (role !== 'admin' && role !== 'member') {
      return errorResponse('نقش نامعتبر است (باید admin یا member باشد)', 400);
    }

    // Protect primary admin from demotion
    if (targetUserId === 'a0000000-0000-0000-0000-000000000001' && role !== 'admin') {
      return errorResponse('نمی‌توان نقش مدیر اصلی سیستم را تغییر داد', 400);
    }

    await saveStoredUserAsync({ id: targetUserId, role });

    return successResponse({
      id: targetUserId,
      role,
      message: `نقش کاربر با موفقیت به ${role === 'admin' ? 'مدیر' : 'کاربر عادی'} تغییر یافت`,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'خطا در تغییر نقش کاربر', 500);
  }
}
