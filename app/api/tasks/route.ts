import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionUser, DEFAULT_USERS } from '@/lib/auth';
import {
  createTaskSchema,
  taskQuerySchema,
} from '@/lib/validations/task.schema';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/utils/api-response';
import type { Task, PaginationMeta, UserSummary } from '@/types/task';

// Helper to resolve user summaries for task assignees and creators
async function resolveUsersMap(): Promise<Map<string, UserSummary>> {
  const map = new Map<string, UserSummary>();

  // Add default/fallback users
  for (const u of DEFAULT_USERS) {
    map.set(u.id, {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      role: u.role,
    });
  }

  // Try fetching fresh profiles from Supabase
  try {
    const client = supabase.client;
    const { data } = await client.from('profiles').select('id, email, full_name, avatar_url, role');
    if (data && data.length > 0) {
      for (const p of data) {
        map.set(p.id, p);
      }
    }
  } catch {
    // Ignore if table not present
  }

  return map;
}

// GET /api/tasks - List tasks with filtering, search, pagination and user joins
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

    // Filter by assigned user
    if (query.assigned_to) {
      dbQuery = dbQuery.eq('assigned_to', query.assigned_to);
    }

    // Filter by creator
    if (query.created_by) {
      dbQuery = dbQuery.eq('created_by', query.created_by);
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

    // Attach assignee and creator objects
    const usersMap = await resolveUsersMap();
    const tasksWithUsers = ((data as any[]) || []).map((t) => ({
      ...t,
      assignee: t.assigned_to ? usersMap.get(t.assigned_to) || null : null,
      creator: t.created_by ? usersMap.get(t.created_by) || null : null,
    }));

    const total = count ?? 0;
    const totalPages = Math.ceil(total / query.limit) || 1;

    const meta: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPrevPage: query.page > 1,
    };

    return successResponse<Task[]>(tasksWithUsers as Task[], 200, meta);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tasks - Create a new task with assignment & creator
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body in request', 400);
    }

    // Check session
    const session = await getSessionUser(request);

    // Validate request payload
    const validatedData = createTaskSchema.parse(body);

    const createdBy = validatedData.created_by || session?.id || null;
    const assignedTo = validatedData.assigned_to || null;

    const client = supabase.client;
    const insertPayload: any = {
      title: validatedData.title,
      description: validatedData.description ?? null,
      status: validatedData.status,
      priority: validatedData.priority,
      due_date: validatedData.due_date ?? null,
    };

    if (createdBy) insertPayload.created_by = createdBy;
    if (assignedTo) insertPayload.assigned_to = assignedTo;

    const { data, error } = await client
      .from('tasks')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      // In case columns created_by / assigned_to are not yet in Supabase schema
      if (error.message?.includes('column') && (insertPayload.created_by || insertPayload.assigned_to)) {
        delete insertPayload.created_by;
        delete insertPayload.assigned_to;
        const retry = await client.from('tasks').insert([insertPayload]).select().single();
        if (retry.error) throw retry.error;
        return successResponse<Task>(retry.data as Task, 201);
      }
      throw error;
    }

    return successResponse<Task>(data as Task, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
