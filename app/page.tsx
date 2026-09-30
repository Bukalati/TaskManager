export default function HomePage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/tasks',
      desc: 'List tasks with filtering (status, priority), search, and pagination',
      params: '?page=1&limit=10&status=TODO&priority=HIGH&search=meeting&sortBy=created_at&sortOrder=desc',
    },
    {
      method: 'POST',
      path: '/api/tasks',
      desc: 'Create a new task with title, description, status, priority, due_date',
      body: {
        title: 'Complete project planning',
        description: 'Design DB schema and Zod validation',
        status: 'TODO',
        priority: 'HIGH',
        due_date: '2026-10-15T18:00:00Z',
      },
    },
    {
      method: 'GET',
      path: '/api/tasks/:id',
      desc: 'Retrieve a single task by UUID',
    },
    {
      method: 'PATCH',
      path: '/api/tasks/:id',
      desc: 'Update task properties',
      body: {
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      },
    },
    {
      method: 'DELETE',
      path: '/api/tasks/:id',
      desc: 'Delete a task permanently',
    },
  ];

  return (
    <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', margin: 0, color: '#38bdf8' }}>🚀 Task Management API</h1>
        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '15px' }}>
          Built with Next.js (App Router), Bun, Supabase (PostgreSQL), and Zod.
        </p>
      </header>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', color: '#e2e8f0', marginBottom: '15px' }}>API Endpoints</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                padding: '16px 20px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor:
                      ep.method === 'GET'
                        ? '#0284c7'
                        : ep.method === 'POST'
                        ? '#16a34a'
                        : ep.method === 'PATCH'
                        ? '#d97706'
                        : '#dc2626',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {ep.method}
                </span>
                <code style={{ fontSize: '15px', color: '#f1f5f9' }}>{ep.path}</code>
              </div>
              <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '14px' }}>{ep.desc}</p>
              {ep.params && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Query params example:</span>
                  <pre
                    style={{
                      background: '#0f172a',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#38bdf8',
                      overflowX: 'auto',
                    }}
                  >
                    {ep.params}
                  </pre>
                </div>
              )}
              {ep.body && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>JSON Body example:</span>
                  <pre
                    style={{
                      background: '#0f172a',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#a7f3d0',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(ep.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #334155',
          marginTop: '30px',
        }}
      >
        <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#facc15' }}>⚙️ Setup Notice</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
          Please make sure your <code>.env.local</code> file contains your valid <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      </section>
    </main>
  );
}
