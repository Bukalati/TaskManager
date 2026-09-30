-- ==============================================================
-- TaskFlow Database Schema & Migration
-- Profiles, Authentication, and Task Assignment System
-- ==============================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Update Tasks Table for Multi-user Assignment
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);

-- 3. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access via API (handled and protected by Next.js Backend)
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Allow public all tasks" ON public.tasks FOR ALL USING (true);

-- 4. Seed Initial Super Admin and Demo Accounts
-- Default Admin: admin@taskflow.local / Admin@123456
INSERT INTO public.profiles (id, email, password_hash, full_name, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@taskflow.local',
  '$2b$10$Aq32jNuxRikaxBWX1.xmQ.lz74QkEEkLZkyUok3pfr0TCXZz1KcTK',
  'مدیر سیستم (Super Admin)',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Demo Member 1: sara@taskflow.local / Sara@123456
INSERT INTO public.profiles (id, email, password_hash, full_name, role)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'sara@taskflow.local',
  '$2b$10$/D1.XUtSb72H4zg9Wexs1OeYvLEoKUtdox8N5JgtFDTou4Ob24Xvq',
  'سارا محمدی',
  'member'
)
ON CONFLICT (email) DO NOTHING;

-- Demo Member 2: ali@taskflow.local / Ali@123456
INSERT INTO public.profiles (id, email, password_hash, full_name, role)
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'ali@taskflow.local',
  '$2b$10$W90dRgVqUbKd/56XxlzscuL32tVWJD8vyhtmbEXhj2V3/J5cS6wKu',
  'علی کریمی',
  'member'
)
ON CONFLICT (email) DO NOTHING;
