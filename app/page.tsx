'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Search,
  ArrowRight,
  ArrowLeft,
  X,
  AlertTriangle,
  RotateCcw,
  Layers,
  Flame,
  CheckSquare,
  Clock,
  Languages,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types/task';

// Multilingual text dictionary
const DICTIONARY = {
  fa: {
    appTitle: 'مدیریت تسک‌ها',
    boardVersion: '✦ BOARD v2.0',
    searchPlaceholder: '🔍 جستجو در تسک‌ها...',
    allPriorities: 'همه اولویت‌ها',
    highPriority: 'فقط فوری (High)',
    medPriority: 'فقط متوسط (Medium)',
    lowPriority: 'فقط کم (Low)',
    newTask: 'تسک جدید',
    refresh: 'بارگذاری مجدد',
    totalTasks: '[ ۰۱ ] کل تسک‌ها',
    inProgressStats: '[ ۰۲ ] در حال اجرا',
    doneStats: '[ ۰۳ ] انجام شده',
    todoStats: '[ ۰۴ ] مانده برای انجام',
    loading: '⚡ در حال دریافت اطلاعات از سرور...',
    emptyTitle: 'هنوز هیچ تسکی اضافه نکردید!',
    emptyDesc: 'میز کار شما در حال حاضر کاملاً تمیز و خالیه. برای شروع مدیریت و برنامه‌ریزی، اولین تسک خودت رو بساز!',
    createFirstTask: 'ساخت اولین تسک',
    noTasksInCol: 'تسکی در این بخش نیست',
    createTaskModalTitle: 'ایجاد تسک جدید',
    editTaskModalTitle: 'ویرایش تسک',
    titleLabel: 'عنوان تسک *',
    titlePlaceholder: 'مثلاً: طراحی دیتابیس یا جلسه با تیم',
    descLabel: 'توضیحات (اختیاری)',
    descPlaceholder: 'جزئیات و نکات مربوط به تسک...',
    priorityLabel: 'اولویت',
    selectPriority: 'انتخاب اولویت:',
    dueDateLabel: 'مهلت انجام (اختیاری)',
    cancel: 'انصراف',
    save: 'ذخیره تغییرات',
    create: 'ایجاد تسک',
    saving: 'در حال ذخیره...',
    titleRequired: 'عنوان تسک الزامی است',
    back: 'به عقب',
    startTask: 'شروع کار',
    completeTask: 'تکمیل شد',
    deleteTaskBtn: '🗑️ حذف تسک',
    deleteConfirm: 'آیا از حذف این تسک اطمینان دارید؟',
    quickDates: {
      today: 'امروز',
      tomorrow: 'فردا',
      nextWeek: 'هفته بعد',
      clear: 'بدون تاریخ',
    },
    cols: {
      TODO: 'برای انجام',
      IN_PROGRESS: 'در حال انجام',
      DONE: 'انجام شده',
    },
    priorities: {
      LOW: 'کم (Low)',
      MEDIUM: 'متوسط (Medium)',
      HIGH: 'فوری (High)',
    },
  },
  en: {
    appTitle: 'Task Manager',
    boardVersion: '✦ BOARD v2.0',
    searchPlaceholder: '🔍 Search tasks...',
    allPriorities: 'All Priorities',
    highPriority: 'High Priority',
    medPriority: 'Medium Priority',
    lowPriority: 'Low Priority',
    newTask: 'New Task',
    refresh: 'Refresh',
    totalTasks: '[ 01 ] Total Tasks',
    inProgressStats: '[ 02 ] In Progress',
    doneStats: '[ 03 ] Completed',
    todoStats: '[ 04 ] Pending (To Do)',
    loading: '⚡ Loading data from server...',
    emptyTitle: 'No tasks added yet!',
    emptyDesc: 'Your workspace is completely empty. Create your first task to get things moving!',
    createFirstTask: 'Create First Task',
    noTasksInCol: 'No tasks in this section',
    createTaskModalTitle: 'Create New Task',
    editTaskModalTitle: 'Edit Task',
    titleLabel: 'Task Title *',
    titlePlaceholder: 'e.g. Design database or client meeting',
    descLabel: 'Description (Optional)',
    descPlaceholder: 'Notes and details about the task...',
    priorityLabel: 'Priority',
    selectPriority: 'Select Priority:',
    dueDateLabel: 'Due Date (Optional)',
    cancel: 'Cancel',
    save: 'Save Changes',
    create: 'Create Task',
    saving: 'Saving...',
    titleRequired: 'Task title is required',
    back: 'Back',
    startTask: 'Start Work',
    completeTask: 'Complete',
    deleteTaskBtn: '🗑️ Delete Task',
    deleteConfirm: 'Are you sure you want to delete this task?',
    quickDates: {
      today: 'Today',
      tomorrow: 'Tomorrow',
      nextWeek: 'Next Week',
      clear: 'No Date',
    },
    cols: {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      DONE: 'Completed',
    },
    priorities: {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
    },
  },
};

const PRIORITY_THEME: Record<
  TaskPriority,
  { bg: string; color: string; border: string }
> = {
  LOW: { bg: '#E4D4F4', color: '#000000', border: '#000000' },
  MEDIUM: { bg: '#FFE600', color: '#000000', border: '#000000' },
  HIGH: { bg: '#FF66C4', color: '#000000', border: '#000000' },
};

export default function KanbanPage() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const t = DICTIONARY[lang];
  const isRTL = lang === 'fa';

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

  // Form Fields (Status removed from modal, priority has toggle state)
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority | null;
    due_date: string;
  }>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: '',
  });

  // Drag & Drop State
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tasks?limit=100&sortBy=created_at&sortOrder=desc');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'خطا در ارتباط با سرور');
      }
      setTasks(json.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('خطای ناشناخته در بارگذاری تسک‌ها');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks
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

  // Bento counts
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    return { total, todo, inProgress, done };
  }, [tasks]);

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

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.substring(0, 10) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError(t.titleRequired);
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority || 'MEDIUM',
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      };

      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error updating task');

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? json.data : t))
        );
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error creating task');

        setTasks((prev) => [json.data, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Error saving task');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Error deleting task');
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error updating status');
    } catch {
      fetchTasks();
    }
  };

  // Quick date helper
  const setQuickDate = (daysAhead: number | null) => {
    if (daysAhead === null) {
      setFormData((prev) => ({ ...prev, due_date: '' }));
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split('T')[0] ?? '';
    setFormData((prev) => ({ ...prev, due_date: dateStr }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) setDragOverColumn(status);
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
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Banner */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '3px solid #000000',
          boxShadow: '0 4px 0 #000000',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08) rotate(-4deg)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
            >
              <img
                src="/logo.png"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
                alt="Task Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1
                  style={{
                    fontSize: '36px',
                    fontWeight: 900,
                    color: '#000000',
                    margin: 0,
                    lineHeight: '1.1',
                    textShadow: '2px 2px 0px #FFE600',
                  }}
                >
                  {t.appTitle}
                </h1>
                <span
                  style={{
                    backgroundColor: '#FFE600',
                    color: '#000000',
                    border: '2px solid #000000',
                    boxShadow: '2px 2px 0 #000000',
                    borderRadius: '6px',
                    fontSize: '12px',
                    padding: '2px 8px',
                    fontWeight: 'bold',
                    transform: isRTL ? 'rotate(-2deg)' : 'rotate(2deg)',
                  }}
                >
                  {t.boardVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neo-input"
                style={{
                  width: '210px',
                  paddingLeft: '12px',
                  paddingRight: '14px',
                }}
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="neo-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="ALL">{t.allPriorities}</option>
              <option value="HIGH">{t.highPriority}</option>
              <option value="MEDIUM">{t.medPriority}</option>
              <option value="LOW">{t.lowPriority}</option>
            </select>

            {/* Language Switcher Toggle */}
            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              title={lang === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
              className="neo-btn"
              style={{
                backgroundColor: '#E4D4F4',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 'bold',
              }}
            >
              <Languages size={18} />
              <span>{lang === 'fa' ? 'EN' : 'فارسی'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchTasks}
              title={t.refresh}
              className="neo-btn"
              style={{
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
            >
              <RotateCcw size={16} />
            </button>

            {/* Create Task Button */}
            <button
              onClick={() => handleOpenCreateModal('TODO')}
              className="neo-btn"
              style={{
                backgroundColor: '#FFE600',
                fontSize: '18px',
                padding: '8px 22px',
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              {t.newTask}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '28px 32px',
          flex: 1,
        }}
      >
        {/* Error Notification */}
        {error && (
          <div
            style={{
              backgroundColor: '#FF66C4',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0 #000000',
              borderRadius: '8px',
              padding: '12px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
            }}
          >
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Bento Grid Stats */}
        {!loading && tasks.length > 0 && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: '#555555' }}>{t.totalTasks}</span>
                <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.1' }}>
                  {stats.total}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#FFE600',
                  border: '2px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={22} />
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: '#555555' }}>{t.inProgressStats}</span>
                <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.1' }}>
                  {stats.inProgress}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#38BDF8',
                  border: '2px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flame size={22} />
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: '#555555' }}>{t.doneStats}</span>
                <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.1' }}>
                  {stats.done}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#4EFA8A',
                  border: '2px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckSquare size={22} />
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: '#555555' }}>{t.todoStats}</span>
                <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.1' }}>
                  {stats.todo}
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#E4D4F4',
                  border: '2px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={22} />
              </div>
            </div>
          </section>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#FFE600',
                border: '3px solid #000000',
                boxShadow: '5px 5px 0 #000000',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '24px',
              }}
            >
              {t.loading}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && tasks.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              minHeight: '480px',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3.5px solid #000000',
                boxShadow: '8px 8px 0 #000000',
                borderRadius: '24px',
                padding: '48px 40px',
                maxWidth: '560px',
                width: '100%',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  [isRTL ? 'left' : 'right']: '16px',
                  backgroundColor: '#FF66C4',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0 #000000',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transform: isRTL ? 'rotate(-5deg)' : 'rotate(5deg)',
                }}
              >
                ★ 0 TASKS FOUND
              </div>

              {/* Vector 3D Playful Illustration */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <svg
                  width="180"
                  height="160"
                  viewBox="0 0 200 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: 'inline-block' }}
                >
                  <path
                    d="M30 30L34 42L46 46L34 50L30 62L26 50L14 46L26 42Z"
                    fill="#FFE600"
                    stroke="#000000"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M170 40L173 49L182 52L173 55L170 64L167 55L158 52L167 49Z"
                    fill="#38BDF8"
                    stroke="#000000"
                    strokeWidth="2.5"
                  />
                  <circle cx="170" cy="130" r="8" fill="#4EFA8A" stroke="#000000" strokeWidth="2.5" />
                  <circle cx="35" cy="125" r="6" fill="#FF66C4" stroke="#000000" strokeWidth="2" />

                  {/* 3D Isometric Empty Box / Clipboard */}
                  <rect x="58" y="48" width="94" height="110" rx="14" fill="#000000" />
                  <rect
                    x="50"
                    y="40"
                    width="94"
                    height="110"
                    rx="14"
                    fill="#FFFFFF"
                    stroke="#000000"
                    strokeWidth="3.5"
                  />

                  {/* Clipboard Clip Top */}
                  <rect
                    x="75"
                    y="30"
                    width="44"
                    height="20"
                    rx="6"
                    fill="#FFE600"
                    stroke="#000000"
                    strokeWidth="3"
                  />
                  <circle cx="97" cy="38" r="4" fill="#000000" />

                  {/* Empty dashed lines inside */}
                  <line x1="68" y1="75" x2="126" y2="75" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />
                  <line x1="68" y1="95" x2="126" y2="95" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />
                  <line x1="68" y1="115" x2="110" y2="115" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />

                  {/* Friendly Playful Face */}
                  <circle cx="85" cy="95" r="4" fill="#000000" />
                  <circle cx="109" cy="95" r="4" fill="#000000" />
                  <path d="M91 106C94 110 100 110 103 106" stroke="#000000" strokeWidth="3" strokeLinecap="round" />

                  {/* Floating Star Badge */}
                  <g transform="translate(125, 90) rotate(15)">
                    <rect x="0" y="0" width="36" height="36" rx="8" fill="#FF7A00" stroke="#000000" strokeWidth="2.5" />
                    <text x="9" y="24" fontSize="18" fill="#FFFFFF" fontWeight="bold">✦</text>
                  </g>
                </svg>
              </div>

              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#000000',
                  margin: '0 0 10px',
                  lineHeight: '1.2',
                }}
              >
                {t.emptyTitle}
              </h2>

              <p
                style={{
                  fontSize: '17px',
                  color: '#4B5563',
                  margin: '0 0 28px',
                  lineHeight: '1.6',
                }}
              >
                {t.emptyDesc}
              </p>

              <button
                onClick={() => handleOpenCreateModal('TODO')}
                className="neo-btn"
                style={{
                  backgroundColor: '#FFE600',
                  fontSize: '20px',
                  padding: '12px 32px',
                  boxShadow: '5px 5px 0 #000000',
                }}
              >
                <Plus size={24} strokeWidth={3} />
                {t.createFirstTask}
              </button>
            </div>
          </div>
        )}

        {/* 3 KANBAN COLUMNS */}
        {!loading && tasks.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((colId) => {
              const columnTasks = filteredTasks.filter((t) => t.status === colId);
              const isOver = dragOverColumn === colId;
              const colTitle = t.cols[colId];
              const badgeBg =
                colId === 'TODO'
                  ? '#FFE600'
                  : colId === 'IN_PROGRESS'
                  ? '#38BDF8'
                  : '#4EFA8A';

              return (
                <div
                  key={colId}
                  onDragOver={(e) => handleDragOver(e, colId)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, colId)}
                  style={{
                    backgroundColor: isOver ? '#FFFBE6' : '#FFFFFF',
                    border: '3.5px solid #000000',
                    boxShadow: isOver ? '8px 8px 0 #000000' : '6px 6px 0 #000000',
                    borderRadius: '16px',
                    padding: '20px',
                    minHeight: '560px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.15s ease',
                    transform: isOver ? 'scale(1.01)' : 'none',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '16px',
                      borderBottom: '3px solid #000000',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          backgroundColor: badgeBg,
                          border: '2px solid #000000',
                          boxShadow: '2px 2px 0 #000000',
                          padding: '3px 12px',
                          borderRadius: '8px',
                          fontSize: '17px',
                          fontWeight: 900,
                        }}
                      >
                        {colTitle}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#000000',
                          color: '#FFFFFF',
                          padding: '2px 10px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        {columnTasks.length}
                      </span>

                      <button
                        onClick={() => handleOpenCreateModal(colId)}
                        title="Add task"
                        className="neo-btn"
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '2px 2px 0 #000000',
                        }}
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Task Cards List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    {columnTasks.length === 0 ? (
                      <div
                        style={{
                          border: '2.5px dashed #A0AEC0',
                          borderRadius: '12px',
                          padding: '36px 16px',
                          textAlign: 'center',
                          color: '#718096',
                          fontSize: '15px',
                        }}
                      >
                        {t.noTasksInCol}
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const priorityInfo = PRIORITY_THEME[task.priority];
                        const priorityLabel = t.priorities[task.priority];

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '2.5px solid #000000',
                              boxShadow: '4px 4px 0 #000000',
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: 'grab',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translate(-2px, -2px)';
                              e.currentTarget.style.boxShadow = '6px 6px 0 #000000';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = '4px 4px 0 #000000';
                            }}
                          >
                            {/* Card Top: Title & Edit/Delete icons */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '10px',
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: '18px',
                                  fontWeight: 800,
                                  color: task.status === 'DONE' ? '#6B7280' : '#000000',
                                  textDecoration:
                                    task.status === 'DONE' ? 'line-through' : 'none',
                                  margin: 0,
                                  lineHeight: '1.3',
                                }}
                              >
                                {task.title}
                              </h3>

                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleOpenEditModal(task)}
                                  title="Edit"
                                  className="neo-btn"
                                  style={{
                                    padding: '4px 6px',
                                    backgroundColor: '#FFFFFF',
                                    boxShadow: '2px 2px 0 #000000',
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>

                                {/* Only show trash icon if NOT in DONE column (DONE has its own dedicated big button) */}
                                {task.status !== 'DONE' && (
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    title="Delete"
                                    className="neo-btn"
                                    style={{
                                      padding: '4px 6px',
                                      backgroundColor: '#FF66C4',
                                      boxShadow: '2px 2px 0 #000000',
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Card Description */}
                            {task.description && (
                              <p
                                style={{
                                  fontSize: '14px',
                                  color: '#374151',
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
                                paddingTop: '8px',
                                borderTop: '2px dashed #E5E7EB',
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor: priorityInfo.bg,
                                  color: priorityInfo.color,
                                  border: '1.5px solid #000000',
                                  boxShadow: '1.5px 1.5px 0 #000000',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {priorityLabel}
                              </span>

                              {task.due_date && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '12px',
                                    color: '#4B5563',
                                    backgroundColor: '#F3F4F6',
                                    border: '1.5px solid #000000',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  <Calendar size={13} />
                                  <span>
                                    {isRTL
                                      ? new Date(task.due_date).toLocaleDateString('fa-IR', {
                                          month: 'short',
                                          day: 'numeric',
                                        })
                                      : new Date(task.due_date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
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
                                alignItems: 'center',
                                gap: '8px',
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
                                  className="neo-btn"
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    padding: '4px 10px',
                                    fontSize: '13px',
                                  }}
                                >
                                  {isRTL ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
                                  {t.back}
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
                                  className="neo-btn"
                                  style={{
                                    backgroundColor:
                                      task.status === 'IN_PROGRESS' ? '#4EFA8A' : '#38BDF8',
                                    padding: '4px 12px',
                                    fontSize: '13px',
                                    [isRTL ? 'marginRight' : 'marginLeft']: 'auto',
                                  }}
                                >
                                  {task.status === 'IN_PROGRESS' ? (
                                    <>
                                      <CheckCircle2 size={14} />
                                      {t.completeTask}
                                    </>
                                  ) : (
                                    <>
                                      {t.startTask}
                                      {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* SPECIAL DEDICATED DELETE BUTTON IN COMPLETED (DONE) COLUMN */}
                            {task.status === 'DONE' && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="neo-btn"
                                style={{
                                  backgroundColor: '#FF66C4',
                                  color: '#000000',
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  marginTop: '4px',
                                  boxShadow: '3px 3px 0 #000000',
                                  border: '2px solid #000000',
                                }}
                              >
                                {t.deleteTaskBtn}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '4px solid #000000',
              boxShadow: '10px 10px 0 #000000',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              padding: '26px',
            }}
          >
            {/* Modal Title Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '3px solid #000000',
                marginBottom: '18px',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  margin: 0,
                }}
              >
                {editingTask ? t.editTaskModalTitle : t.createTaskModalTitle}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="neo-btn"
                style={{
                  backgroundColor: '#FF66C4',
                  padding: '4px 8px',
                  boxShadow: '2px 2px 0 #000000',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: '#FF66C4',
                  border: '2px solid #000000',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px',
                  fontWeight: 'bold',
                }}
              >
                ⚠️ {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmitForm}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* 1. Title */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                  }}
                >
                  {t.titleLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.titlePlaceholder}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="neo-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* 2. Description (Optional) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                  }}
                >
                  {t.descLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.descPlaceholder}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="neo-input"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* 3. Priority Selector (Badge with Cross or 3 buttons) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  {t.priorityLabel}
                </label>

                {formData.priority ? (
                  /* Selected Priority Badge with ✕ remove button */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        backgroundColor: PRIORITY_THEME[formData.priority].bg,
                        border: '2.5px solid #000000',
                        boxShadow: '3px 3px 0 #000000',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: 'bold',
                        fontSize: '15px',
                      }}
                    >
                      <span>✦ {t.priorities[formData.priority]}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: null })}
                        title="Remove / Change"
                        style={{
                          background: '#000000',
                          border: 'none',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                    <span style={{ fontSize: '13px', color: '#666666' }}>
                      (جهت تغییر، روی ✕ کلیک کنید)
                    </span>
                  </div>
                ) : (
                  /* 3 Selectable Buttons */
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => {
                      const theme = PRIORITY_THEME[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className="neo-btn"
                          style={{
                            backgroundColor: theme.bg,
                            padding: '6px 14px',
                            fontSize: '14px',
                          }}
                        >
                          {t.priorities[p]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Due Date (Simplified with standard date picker + quick helpers) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                  }}
                >
                  {t.dueDateLabel}
                </label>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="neo-input"
                    style={{ flex: 1, cursor: 'pointer' }}
                  />
                  {formData.due_date && (
                    <button
                      type="button"
                      onClick={() => setQuickDate(null)}
                      title="Clear"
                      className="neo-btn"
                      style={{
                        backgroundColor: '#FFFFFF',
                        padding: '8px 12px',
                        boxShadow: '2px 2px 0 #000000',
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Quick Date Chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="neo-btn"
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '3px 10px',
                      fontSize: '12px',
                      boxShadow: '2px 2px 0 #000000',
                    }}
                  >
                    📅 {t.quickDates.today}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="neo-btn"
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '3px 10px',
                      fontSize: '12px',
                      boxShadow: '2px 2px 0 #000000',
                    }}
                  >
                    🚀 {t.quickDates.tomorrow}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="neo-btn"
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '3px 10px',
                      fontSize: '12px',
                      boxShadow: '2px 2px 0 #000000',
                    }}
                  >
                    🗓️ {t.quickDates.nextWeek}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="neo-btn"
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '8px 20px',
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="neo-btn"
                  style={{
                    backgroundColor: '#FFE600',
                    padding: '8px 26px',
                    fontSize: '17px',
                    boxShadow: '4px 4px 0 #000000',
                  }}
                >
                  {submitting
                    ? t.saving
                    : editingTask
                    ? t.save
                    : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
