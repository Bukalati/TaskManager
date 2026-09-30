import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { PaginationMeta } from '@/types/task';

export function successResponse<T>(
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
  message?: string
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
      ...(message ? { message } : {}),
    },
    { status: statusCode }
  );
}

export function errorResponse(
  error: string,
  statusCode = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details !== undefined ? { details } : {}),
    },
    { status: statusCode }
  );
}

export function handleApiError(err: unknown) {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return errorResponse('Validation failed', 400, formattedErrors);
  }

  // Handle Supabase/PostgREST errors
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const postgrestErr = err as { code: string; message: string; details?: string };
    
    // PGRST116: The result contains 0 rows (when single() is called)
    if (postgrestErr.code === 'PGRST116') {
      return errorResponse('Task not found', 404);
    }

    // 22P02: invalid input syntax for type uuid
    if (postgrestErr.code === '22P02') {
      return errorResponse('Invalid UUID format', 400);
    }

    return errorResponse(postgrestErr.message || 'Database error occurred', 400, postgrestErr.details);
  }

  if (err instanceof Error) {
    if (err.message.includes('Supabase credentials')) {
      return errorResponse(err.message, 500);
    }
    return errorResponse(err.message, 500);
  }

  return errorResponse('Internal server error', 500);
}
