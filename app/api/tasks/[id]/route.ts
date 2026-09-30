import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  taskIdParamSchema,
  updateTaskSchema,
} from '@/lib/validations/task.schema';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/utils/api-response';
import type { Task } from '@/types/task';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/tasks/[id] - Get a single task by ID
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    taskIdParamSchema.parse({ id });

    const client = supabase.client;
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return successResponse<Task>(data as Task, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    taskIdParamSchema.parse({ id });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body in request', 400);
    }

    const validatedData = updateTaskSchema.parse(body);

    const client = supabase.client;

    // Check first if task exists
    const { data: existingTask, error: fetchError } = await client
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return errorResponse('Task not found', 404);
    }

    const updatePayload: Record<string, unknown> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await client
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes('column') && ('assigned_to' in updatePayload || 'created_by' in updatePayload)) {
        delete updatePayload.assigned_to;
        delete updatePayload.created_by;
        const retry = await client
          .from('tasks')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();
        if (retry.error) throw retry.error;
        data = retry.data;
      } else {
        throw error;
      }
    }

    return successResponse<Task>(
      data as Task,
      200,
      undefined,
      'Task updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    taskIdParamSchema.parse({ id });

    const client = supabase.client;

    const { data, error } = await client
      .from('tasks')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return errorResponse('Task not found', 404);
    }

    return successResponse(
      { id, deleted: true },
      200,
      undefined,
      'Task deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
