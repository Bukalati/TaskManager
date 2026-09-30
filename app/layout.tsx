import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Management API',
  description: 'RESTful API for Task Management built with Next.js, Supabase, and Zod',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
