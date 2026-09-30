'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  ArrowLeft,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types/task';

const STATUS_COLUMNS: {
  id: TaskStatus;
  title: string;
  badgeBg: string;
  badgeColor: string;
  borderColor: string;
}[] = [
  {
    id: 'TODO',
    title: 'برای انجام (TODO)',
    badgeBg: '#1e293b',
    badgeColor: '#94a3b8',
    borderColor: '#38bdf8',
  },
  {
    id: 'IN_PROGRESS',
    title: 'در حال انجام (IN PROGRESS)',
    badgeBg: '#451a03',
    badgeColor: '#fbbf24',
    borderColor: '#f59e0b',
  },
  {
    id: 'DONE',
    title: 'انجام شده (DONE)',
    badgeBg: '#064e3b',
    badgeColor: '#34d399',
    borderColor: '#10b981',
  },
];

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  LOW: { label: 'کم (Low)', color: '#38bdf8', bg: '#082f49' },
  MEDIUM: { label: 'متوسط (Medium)', color: '#fbbf24', bg: '#451a03' },
  HIGH: { label: 'فوری / بالا (High)', color: '#f87171', bg: '#450a0a' },
};

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    due_date: '',
  });

  // Drag & Drop State
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tasks?limit=100&sortBy=created_at&sortOrder=desc');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'خطا در برقراری ارتباط با سرور');
      }
      setTasks(json.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('خطای ناشناخته رخ داد');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks by search query and priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'ALL' || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Open modal for new task
  const handleOpenCreateModal = (defaultStatus: TaskStatus = 'TODO') => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'MEDIUM',
      due_date: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing task
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.substring(0, 16) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('عنوان تسک الزامی است');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      };

      if (editingTask) {
        // Update task
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'خطا در ویرایش تسک');

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? json.data : t))
        );
      } else {
        // Create new task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'خطا در ایجاد تسک');

        setTasks((prev) => [json.data, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('خطایی در ذخیره تسک رخ داد');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (!confirm('آیا از حذف این تسک اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'خطا در حذف تسک');
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'خطا در حذف');
    }
  };

  // Change Task Status (Quick move or Drag & Drop)
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('خطا در تغییر وضعیت');
      }
    } catch {
      // Revert on error
      fetchTasks();
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      handleUpdateStatus(taskId, status);
    }
    setDraggingTaskId(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: '#0f172a',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>
              مدیریت تسک‌ها (Task Board)
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' }}>
              مجهز به Next.js، Bun، Supabase و Zod
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                right: '12px',
                color: '#64748b',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="جستجو در تسک‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                padding: '8px 38px 8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                width: '200px',
              }}
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">همه اولویت‌ها</option>
            <option value="HIGH">فقط فوری (High)</option>
            <option value="MEDIUM">فقط متوسط (Medium)</option>
            <option value="LOW">فقط کم (Low)</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchTasks}
            title="به‌روزرسانی"
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={16} />
          </button>

          {/* New Task Button */}
          <button
            onClick={() => handleOpenCreateModal('TODO')}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Plus size={18} />
            تسک جدید
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px 28px', overflowX: 'auto' }}>
        {error && (
          <div
            style={{
              backgroundColor: '#450a0a',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Kanban Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            const isOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  backgroundColor: isOver ? '#1e293b' : '#0f172a',
                  border: `2px solid ${isOver ? col.borderColor : '#1e293b'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '520px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #334155',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: col.borderColor,
                      }}
                    />
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                      {col.title}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: col.badgeBg,
                        color: col.badgeColor,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {columnTasks.length}
                    </span>

                    <button
                      onClick={() => handleOpenCreateModal(col.id)}
                      title="افزودن به این ستون"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Column Task Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>
                      در حال بارگذاری...
                    </div>
                  ) : columnTasks.length === 0 ? (
                    <div
                      style={{
                        border: '2px dashed #1e293b',
                        borderRadius: '8px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#475569',
                        fontSize: '13px',
                      }}
                    >
                      تسکی در این بخش وجود ندارد
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const priority = PRIORITY_CONFIG[task.priority];

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          style={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: 'grab',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          {/* Card Top: Title & Action icons */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <h3
                              style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: task.status === 'DONE' ? '#94a3b8' : '#f8fafc',
                                textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                                margin: 0,
                                lineHeight: '1.4',
                              }}
                            >
                              {task.title}
                            </h3>

                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                title="ویرایش"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '4px',
                                }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                title="حذف"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '4px',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Card Description */}
                          {task.description && (
                            <p
                              style={{
                                fontSize: '13px',
                                color: '#94a3b8',
                                margin: 0,
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Card Badges: Priority & Due Date */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '8px',
                              paddingTop: '6px',
                              borderTop: '1px solid #283548',
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: priority.bg,
                                color: priority.color,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              {priority.label}
                            </span>

                            {task.due_date && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  color: '#64748b',
                                }}
                              >
                                <Calendar size={12} />
                                <span>
                                  {new Date(task.due_date).toLocaleDateString('fa-IR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Card Bottom Quick Move buttons */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '6px',
                              marginTop: '4px',
                            }}
                          >
                            {task.status !== 'TODO' && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    task.id,
                                    task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO'
                                  )
                                }
                                style={{
                                  backgroundColor: '#0f172a',
                                  color: '#94a3b8',
                                  border: '1px solid #334155',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <ArrowRight size={12} />
                                به عقب
                              </button>
                            )}

                            {task.status !== 'DONE' && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    task.id,
                                    task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE'
                                  )
                                }
                                style={{
                                  backgroundColor: '#0f172a',
                                  color: task.status === 'IN_PROGRESS' ? '#10b981' : '#38bdf8',
                                  border: '1px solid #334155',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginRight: 'auto',
                                }}
                              >
                                {task.status === 'IN_PROGRESS' ? (
                                  <>
                                    <CheckCircle2 size={12} />
                                    تکمیل شد
                                  </>
                                ) : (
                                  <>
                                    شروع کار
                                    <ArrowLeft size={12} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal for Creating or Editing Task */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                {editingTask ? 'ویرایش تسک' : 'تسک جدید'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: '#450a0a',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  عنوان تسک *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: طراحی دیتابیس یا جلسه با تیم"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  توضیحات (اختیاری)
                </label>
                <textarea
                  rows={3}
                  placeholder="جزئیات و نکات مربوط به این کار..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                    ستون / وضعیت
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="TODO">TODO (برای انجام)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (در حال انجام)</option>
                    <option value="DONE">DONE (انجام شده)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                    اولویت
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="LOW">کم (Low)</option>
                    <option value="MEDIUM">متوسط (Medium)</option>
                    <option value="HIGH">فوری / بالا (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  مهلت انجام (Due Date)
                </label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'در حال ذخیره...' : editingTask ? 'ذخیره تغییرات' : 'ایجاد تسک'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
