import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
  errorMap: () => ({ message: 'Status must be one of: TODO, IN_PROGRESS, DONE' }),
});

export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'], {
  errorMap: () => ({ message: 'Priority must be one of: LOW, MEDIUM, HIGH' }),
});

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be 255 characters or less'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or less')
    .nullable()
    .optional(),
  status: TaskStatusEnum.optional().default('TODO'),
  priority: TaskPriorityEnum.optional().default('MEDIUM'),
  due_date: z
    .string()
    .datetime({ message: 'due_date must be a valid ISO 8601 date string (e.g. 2026-10-15T18:00:00Z)' })
    .nullable()
    .optional(),
  assigned_to: z.string().uuid({ message: 'assigned_to must be a valid UUID' }).nullable().optional(),
  created_by: z.string().uuid({ message: 'created_by must be a valid UUID' }).nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be 255 characters or less')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or less')
      .nullable()
      .optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    due_date: z
      .string()
      .datetime({ message: 'due_date must be a valid ISO 8601 date string' })
      .nullable()
      .optional(),
    assigned_to: z.string().uuid({ message: 'assigned_to must be a valid UUID' }).nullable().optional(),
    created_by: z.string().uuid({ message: 'created_by must be a valid UUID' }).nullable().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update the task' }
  );

export const taskIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Task ID format. Must be a valid UUID' }),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(10),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['created_at', 'due_date', 'priority', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  assigned_to: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
});
