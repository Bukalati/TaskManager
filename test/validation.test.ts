import { describe, expect, it } from 'bun:test';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
} from '../lib/validations/task.schema';

describe('Validation Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate a valid task with all fields', () => {
      const input = {
        title: 'Complete documentation',
        description: 'Write API documentation and setup guide',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: '2026-10-15T18:00:00.000Z',
      };

      const result = createTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Complete documentation');
        expect(result.data.status).toBe('IN_PROGRESS');
        expect(result.data.priority).toBe('HIGH');
      }
    });

    it('should apply defaults for status and priority when omitted', () => {
      const input = {
        title: 'Simple task',
      };

      const result = createTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('TODO');
        expect(result.data.priority).toBe('MEDIUM');
        expect(result.data.description).toBeUndefined();
        expect(result.data.due_date).toBeUndefined();
      }
    });

    it('should reject empty or missing title', () => {
      const emptyTitle = { title: '   ' };
      const missingTitle = { description: 'No title' };

      expect(createTaskSchema.safeParse(emptyTitle).success).toBe(false);
      expect(createTaskSchema.safeParse(missingTitle).success).toBe(false);
    });

    it('should reject invalid status', () => {
      const input = {
        title: 'Task',
        status: 'INVALID_STATUS',
      };

      const result = createTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid due_date format', () => {
      const input = {
        title: 'Task',
        due_date: 'not-a-date',
      };

      const result = createTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate partial update', () => {
      const input = {
        status: 'DONE',
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('DONE');
      }
    });

    it('should reject update with no fields', () => {
      const input = {};
      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('taskIdParamSchema', () => {
    it('should accept valid UUID', () => {
      const valid = { id: '123e4567-e89b-12d3-a456-426614174000' };
      expect(taskIdParamSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalid = { id: 'not-a-uuid-123' };
      expect(taskIdParamSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('taskQuerySchema', () => {
    it('should parse and coerce query params with defaults', () => {
      const rawQuery = {};
      const result = taskQuerySchema.safeParse(rawQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe('created_at');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should coerce string numbers for page and limit', () => {
      const rawQuery = {
        page: '3',
        limit: '25',
        status: 'TODO',
        priority: 'HIGH',
        search: 'meeting',
      };
      const result = taskQuerySchema.safeParse(rawQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(25);
        expect(result.data.status).toBe('TODO');
        expect(result.data.priority).toBe('HIGH');
        expect(result.data.search).toBe('meeting');
      }
    });
  });
});
