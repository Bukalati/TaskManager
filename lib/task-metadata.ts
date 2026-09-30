// Helper to seamlessly persist created_by and assigned_to in Supabase tasks table
// even if custom columns have not been added yet via SQL migration.

export interface TaskMeta {
  created_by?: string | null;
  assigned_to?: string | null;
}

export function parseTaskMetadata(description: string | null): {
  cleanDescription: string | null;
  created_by?: string | null;
  assigned_to?: string | null;
} {
  if (!description) return { cleanDescription: null };
  const match = description.match(/<!--taskflow:(.*?)-->/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      const clean = description.replace(/<!--taskflow:(.*?)-->/, '').trim();
      return {
        cleanDescription: clean || null,
        created_by: meta.created_by || null,
        assigned_to: meta.assigned_to || null,
      };
    } catch {
      // Ignore JSON parse errors
    }
  }
  return { cleanDescription: description };
}

export function embedTaskMetadata(
  description: string | null | undefined,
  meta: TaskMeta
): string | null {
  const clean = (description || '').replace(/<!--taskflow:(.*?)-->/, '').trim();
  const metaObj: TaskMeta = {};
  if (meta.created_by) metaObj.created_by = meta.created_by;
  if (meta.assigned_to) metaObj.assigned_to = meta.assigned_to;

  if (!metaObj.created_by && !metaObj.assigned_to) {
    return clean || null;
  }

  const metaTag = `<!--taskflow:${JSON.stringify(metaObj)}-->`;
  return clean ? `${clean}\n\n${metaTag}` : metaTag;
}
