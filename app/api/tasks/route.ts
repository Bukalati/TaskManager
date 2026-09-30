import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser, getAllStoredUsers } from '@/lib/auth';
import {
  createTaskSchema,
  taskQuerySchema,
} from '@/lib/validations/task.schema';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/utils/api-response';
import { parseTaskMetadata, embedTaskMetadata } from '@/lib/task-metadata';
import type { Task, PaginationMeta, UserSummary } from '@/types/task';

// Helper to resolve user summaries for task assignees and creators
async function resolveUsersMap(): Promise<Map<string, UserSummary>> {
  const map = new Map<string, UserSummary>();

  // Add all stored users
  for (const u of getAllStoredUsers()) {
    map.set(u.id, {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      role: u.role,
    });
  }

  // Try fetching fresh profiles from Supabase if table exists
  try {
    const client = supabase.client;
    const { data } = await client.from('profiles').select('id, email, full_name, avatar_url, role');
    if (data && data.length > 0) {
      for (const p of data) {
        map.set(p.id, p);
      }
    }
  } catch {
    // Ignore
  }

  return map;
}

// GET /api/tasks - List tasks with metadata extraction, filtering, and user joins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const query = taskQuerySchema.parse(rawParams);

    const client = supabase.client;
    let dbQuery = client.from('tasks').select('*', { count: 'exact' });

    // Filter by status
    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    // Filter by priority
    if (query.priority) {
      dbQuery = dbQuery.eq('priority', query.priority);
    }

    // Search in title and description
    if (query.search) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query.search}%,description.ilike.%${query.search}%`
      );
    }

    // Ordering
    dbQuery = dbQuery.order(query.sortBy, {
      ascending: query.sortOrder === 'asc',
    });

    // Pagination calculations
    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery.range(offset, offset + query.limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw error;
    }

    const usersMap = await resolveUsersMap();

    // Map each task, extract embedded metadata, clean description, and attach users
    let tasksWithUsers: Task[] = ((data as any[]) || []).map((t) => {
      const meta = parseTaskMetadata(t.description);
      const createdBy = t.created_by || meta.created_by || null;
      const assignedTo = t.assigned_to || meta.assigned_to || null;

      return {
        ...t,
        description: meta.cleanDescription,
        created_by: createdBy,
        assigned_to: assignedTo,
        assignee: assignedTo ? usersMap.get(assignedTo) || null : null,
        creator: createdBy ? usersMap.get(createdBy) || null : null,
      };
    });

    // Filter by assigned_to in memory if requested and not done at DB level
    if (query.assigned_to) {
      tasksWithUsers = tasksWithUsers.filter((t) => t.assigned_to === query.assigned_to);
    }

    // Filter by created_by in memory if requested
    if (query.created_by) {
      tasksWithUsers = tasksWithUsers.filter((t) => t.created_by === query.created_by);
    }

    const total = count ?? tasksWithUsers.length;
    const totalPages = Math.ceil(total / query.limit) || 1;

    const meta: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPrevPage: query.page > 1,
    };

    return successResponse<Task[]>(tasksWithUsers, 200, meta);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tasks - Create a new task with assignment & creator (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionUser(request);
    if (!session) {
      return errorResponse('برای ایجاد تسک، لطفاً ابتدا وارد حساب کاربری خود شوید', 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body in request', 400);
    }

    // Validate request payload
    const validatedData = createTaskSchema.parse(body);

    const createdBy = session.id;
    const assignedTo = validatedData.assigned_to || null;

    // Embed created_by and assigned_to into description for 100% resilient Supabase persistence
    const embeddedDesc = embedTaskMetadata(validatedData.description, {
      created_by: createdBy,
      assigned_to: assignedTo,
    });

    const client = supabase.client;
    const insertPayload: any = {
      title: validatedData.title,
      description: embeddedDesc,
      status: validatedData.status,
      priority: validatedData.priority,
      due_date: validatedData.due_date ?? null,
      created_by: createdBy,
      assigned_to: assignedTo,
    };

    let createdTaskData: any = null;
    const { data, error } = await client
      .from('tasks')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      // In case columns created_by / assigned_to are not yet in Supabase schema, retry without them
      if (error.message?.includes('column')) {
        delete insertPayload.created_by;
        delete insertPayload.assigned_to;
        const retry = await client.from('tasks').insert([insertPayload]).select().single();
        if (retry.error) throw retry.error;
        createdTaskData = retry.data;
      } else {
        throw error;
      }
    } else {
      createdTaskData = data;
    }

    const usersMap = await resolveUsersMap();
    const cleanMeta = parseTaskMetadata(createdTaskData.description);

    const resultTask: Task = {
      ...createdTaskData,
      description: cleanMeta.cleanDescription,
      created_by: createdBy,
      assigned_to: assignedTo,
      assignee: assignedTo ? usersMap.get(assignedTo) || null : null,
      creator: usersMap.get(createdBy) || null,
    };

    return successResponse<Task>(resultTask, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
