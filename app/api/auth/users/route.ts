import { NextRequest, NextResponse } from 'next/server';
import { getAllStoredUsersAsync } from '@/lib/auth';
import { errorResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    const allUsersWithHash = await getAllStoredUsersAsync();
    const allUsers = allUsersWithHash.map(({ password_hash, ...u }) => u);

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

