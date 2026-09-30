import { NextRequest } from 'next/server';
import { supabase } from '../../../lib/supabase';
import {
  createTaskSchema,
  taskQuerySchema,
} from '../../../lib/validations/task.schema';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '../../../lib/utils/api-response';
import type { Task, PaginationMeta } from '../../../types/task';

// GET /api/tasks - List tasks with filtering, search, and pagination
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

    return successResponse<Task[]>(data as Task[], 200, meta);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body in request', 400);
    }

    // Validate request payload
    const validatedData = createTaskSchema.parse(body);

    const client = supabase.client;
    const { data, error } = await client
      .from('tasks')
      .insert([
        {
          title: validatedData.title,
          description: validatedData.description ?? null,
          status: validatedData.status,
          priority: validatedData.priority,
          due_date: validatedData.due_date ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return successResponse<Task>(
      data as Task,
      201,
      undefined,
      'Task created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
