import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import {
  taskIdParamSchema,
  updateTaskSchema,
} from '@/lib/validations/task.schema';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/utils/api-response';
import { parseTaskMetadata, embedTaskMetadata } from '@/lib/task-metadata';
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

    if (error || !data || data.title?.startsWith('__USER__:')) {
      return errorResponse('Task not found', 404);
    }

    const meta = parseTaskMetadata(data.description);
    const cleanTask: Task = {
      ...data,
      description: meta.cleanDescription,
      created_by: data.created_by || meta.created_by || null,
      assigned_to: data.assigned_to || meta.assigned_to || null,
    };

    return successResponse<Task>(cleanTask, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/tasks/[id] - Update a task (requires auth & enforces assignment permissions)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Check authentication
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('برای ویرایش یا تغییر وضعیت تسک، لطفاً ابتدا وارد حساب کاربری خود شوید', 401);
    }

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

    // 2. Fetch existing task
    const { data: existingTask, error: fetchError } = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask || existingTask.title?.startsWith('__USER__:')) {
      return errorResponse('Task not found', 404);
    }

    const existingMeta = parseTaskMetadata(existingTask.description);
    const taskAssignedTo = existingTask.assigned_to || existingMeta.assigned_to || null;
    const taskCreatedBy = existingTask.created_by || existingMeta.created_by || null;

    // 3. Permission checks
    // If updating status (moving task):
    if (validatedData.status !== undefined && validatedData.status !== existingTask.status) {
      if (session.role !== 'admin') {
        // If task is assigned to a specific user, ONLY that user can move it
        if (taskAssignedTo && taskAssignedTo !== session.id) {
          return errorResponse('تنها فرد مسئول این تسک یا مدیر سیستم مجاز به جابجایی و تغییر وضعیت آن است', 403);
        }
      }
    }

    // If updating task details (title, description, priority, due_date, assigned_to):
    const isDetailUpdate =
      validatedData.title !== undefined ||
      validatedData.description !== undefined ||
      validatedData.priority !== undefined ||
      validatedData.due_date !== undefined ||
      validatedData.assigned_to !== undefined;

    if (isDetailUpdate && session.role !== 'admin') {
      const isCreator = taskCreatedBy === session.id;
      const isAssignee = taskAssignedTo === session.id;
      if (!isCreator && !isAssignee) {
        return errorResponse('تنها ایجادکننده، مسئول تسک یا مدیر سیستم می‌توانند این تسک را ویرایش کنند', 403);
      }
    }

    // 4. Prepare update payload
    const newAssignedTo =
      validatedData.assigned_to !== undefined ? validatedData.assigned_to : taskAssignedTo;
    const newCreatedBy = taskCreatedBy;
    const newBaseDesc =
      validatedData.description !== undefined
        ? validatedData.description
        : existingMeta.cleanDescription;

    const embeddedDesc = embedTaskMetadata(newBaseDesc, {
      created_by: newCreatedBy,
      assigned_to: newAssignedTo,
    });

    const updatePayload: Record<string, unknown> = {
      ...validatedData,
      description: embeddedDesc,
      updated_at: new Date().toISOString(),
    };

    if (newAssignedTo !== undefined) {
      updatePayload.assigned_to = newAssignedTo;
    }

    let updatedTaskData: any = null;
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
        updatedTaskData = retry.data;
      } else {
        throw error;
      }
    } else {
      updatedTaskData = data;
    }

    const cleanMeta = parseTaskMetadata(updatedTaskData.description);
    const resultTask: Task = {
      ...updatedTaskData,
      description: cleanMeta.cleanDescription,
      created_by: newCreatedBy,
      assigned_to: newAssignedTo,
    };

    return successResponse<Task>(
      resultTask,
      200,
      undefined,
      'Task updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tasks/[id] - Delete a task (requires auth, only creator or admin)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('برای حذف تسک، لطفاً ابتدا وارد حساب کاربری خود شوید', 401);
    }

    const { id } = await context.params;
    taskIdParamSchema.parse({ id });

    const client = supabase.client;

    // Fetch task first to check creator
    const { data: existingTask, error: fetchError } = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask || existingTask.title?.startsWith('__USER__:')) {
      return errorResponse('Task not found', 404);
    }

    if (session.role !== 'admin') {
      const meta = parseTaskMetadata(existingTask.description);
      const creator = existingTask.created_by || meta.created_by;
      if (creator && creator !== session.id) {
        return errorResponse('تنها ایجادکننده تسک یا مدیر سیستم می‌تواند این تسک را حذف کند', 403);
      }
    }

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
