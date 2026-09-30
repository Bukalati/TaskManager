'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sun,
  Moon,
  ArrowUpDown,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types/task';

// Multilingual text dictionary
const DICTIONARY = {
  fa: {
    appTitle: 'مدیریت تسک‌ها',
    boardVersion: '✦ BOARD v2.0',
    searchPlaceholder: 'جستجو در تسک‌ها...',
    searchBtn: 'جستجو',
    allPriorities: 'همه اولویت‌ها',
    highPriority: 'فقط فوری (High)',
    medPriority: 'فقط متوسط (Medium)',
    lowPriority: 'فقط کم (Low)',
    sortByDateDesc: 'جدیدترین',
    sortByDateAsc: 'قدیمی‌ترین',
    sortByDueDate: 'نزدیک‌ترین مهلت',
    sortLabel: 'مرتب‌سازی:',
    filterLabel: 'اولویت:',
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
    selectPriorityHint: 'جهت تغییر، روی ✕ کلیک کنید',
    dueDateLabel: 'مهلت انجام (اختیاری)',
    cancel: 'انصراف',
    save: 'ذخیره تغییرات',
    create: 'ایجاد تسک',
    saving: 'در حال ذخیره...',
    titleRequired: 'عنوان تسک الزامی است',
    datePastError: 'مهلت انجام نمی‌تواند قبل از امروز باشد',
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
    theme: {
      dark: 'حالت تاریک',
      light: 'حالت روشن',
    },
  },
  en: {
    appTitle: 'Task Manager',
    boardVersion: '✦ BOARD v2.0',
    searchPlaceholder: 'Search tasks...',
    searchBtn: 'Search',
    allPriorities: 'All Priorities',
    highPriority: 'High Only',
    medPriority: 'Medium Only',
    lowPriority: 'Low Only',
    sortByDateDesc: 'Newest First',
    sortByDateAsc: 'Oldest First',
    sortByDueDate: 'Closest Due Date',
    sortLabel: 'Sort by:',
    filterLabel: 'Priority:',
    newTask: 'New Task',
    refresh: 'Refresh',
    totalTasks: '[ 01 ] Total Tasks',
    inProgressStats: '[ 02 ] In Progress',
    doneStats: '[ 03 ] Completed',
    todoStats: '[ 04 ] Pending',
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
    selectPriorityHint: 'Click ✕ to change',
    dueDateLabel: 'Due Date (Optional)',
    cancel: 'Cancel',
    save: 'Save Changes',
    create: 'Create Task',
    saving: 'Saving...',
    titleRequired: 'Task title is required',
    datePastError: 'Due date cannot be in the past',
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
    theme: {
      dark: 'Dark Mode',
      light: 'Light Mode',
    },
  },
};

const PRIORITY_THEME: Record<
  TaskPriority,
  { bg: string; color: string }
> = {
  LOW: { bg: '#E4D4F4', color: '#000000' },
  MEDIUM: { bg: '#FFE600', color: '#000000' },
  HIGH: { bg: '#FF66C4', color: '#000000' },
};

export default function KanbanBoard() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const t = DICTIONARY[lang];
  const isRTL = lang === 'fa';
  const isDark = theme === 'dark';

  // Theme color tokens
  const colors = {
    bgPage: isDark ? '#0b0f19' : '#F7F4EB',
    bgCard: isDark ? '#161e2e' : '#FFFFFF',
    bgHeader: isDark ? '#111827' : '#FFFFFF',
    border: isDark ? '#f8fafc' : '#000000',
    shadow: isDark ? '#38bdf8' : '#000000',
    textMain: isDark ? '#f8fafc' : '#000000',
    textMuted: isDark ? '#94a3b8' : '#555555',
    subCard: isDark ? '#1e293b' : '#F3F4F6',
    borderCol: isDark ? '2.5px solid #f8fafc' : '3px solid #000000',
    shadowCol: isDark ? '5px 5px 0 #38bdf8' : '5px 5px 0 #000000',
    shadowBtn: isDark ? '3px 3px 0 #38bdf8' : '3px 3px 0 #000000',
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search & Sort states (Moved above boards)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'due_date'>('created_desc');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields (Priority defaults to null on new task)
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
    priority: null,
    due_date: '',
  });

  // Drag & Drop State
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Today's date string YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    return new Date().toISOString().split('T')[0] ?? '';
  }, []);

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

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filter & Sort tasks
  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'ALL' || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });

    return list.sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'created_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });
  }, [tasks, searchQuery, priorityFilter, sortBy]);

  // Bento counts
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    return { total, todo, inProgress, done };
  }, [tasks]);

  // Open modal with priority set to null by default
  const handleOpenCreateModal = (defaultStatus: TaskStatus = 'TODO') => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: defaultStatus,
      priority: null, // No default selection!
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

    // Validate that due_date is NOT before today
    if (formData.due_date && formData.due_date < todayDateStr) {
      setFormError(t.datePastError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority || 'MEDIUM', // Seamless default if unpicked
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

  // Quick date helper (Ensures minimum is today)
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
        backgroundColor: colors.bgPage,
        color: colors.textMain,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* 1. Header Banner - Cleaned from filters/search */}
      <header
        style={{
          backgroundColor: colors.bgHeader,
          borderBottom: colors.borderCol,
          boxShadow: isDark ? '0 4px 0 #38bdf8' : '0 4px 0 #000000',
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
                    color: colors.textMain,
                    margin: 0,
                    lineHeight: '1.1',
                    textShadow: isDark ? '2px 2px 0px #38bdf8' : '2px 2px 0px #FFE600',
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

          {/* Action Toolbar: Theme toggle, Language toggle, Refresh, New Task */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? t.theme.light : t.theme.dark}
              className="neo-btn"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: isDark ? '#f8fafc' : '#000000',
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
              }}
            >
              {isDark ? <Sun size={18} color="#FFE600" /> : <Moon size={18} color="#000000" />}
              <span>{isDark ? '☀️ لایت' : '🌙 دارک'}</span>
            </button>

            {/* Language Switcher Toggle */}
            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              title={lang === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
              className="neo-btn"
              style={{
                backgroundColor: isDark ? '#2e1065' : '#E4D4F4',
                color: isDark ? '#f8fafc' : '#000000',
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
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
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
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
                color: '#000000',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
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
              color: '#000000',
              border: colors.borderCol,
              boxShadow: colors.shadowBtn,
              borderRadius: '8px',
              padding: '12px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
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
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                backgroundColor: colors.bgCard,
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>{t.totalTasks}</span>
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
                  color: '#000000',
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
                backgroundColor: colors.bgCard,
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>{t.inProgressStats}</span>
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
                  color: '#000000',
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
                backgroundColor: colors.bgCard,
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>{t.doneStats}</span>
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
                  color: '#000000',
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
                backgroundColor: colors.bgCard,
                border: colors.borderCol,
                boxShadow: colors.shadowBtn,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>{t.todoStats}</span>
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
                  color: '#000000',
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

        {/* 2. Top-of-Boards Filter, Search, and Sort Toolbar */}
        {!loading && tasks.length > 0 && (
          <div
            style={{
              backgroundColor: colors.bgCard,
              border: colors.borderCol,
              boxShadow: colors.shadowBtn,
              borderRadius: '14px',
              padding: '12px 18px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Left: Collapsible Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSearchOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="neo-input"
                    style={{
                      width: '240px',
                      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                      color: colors.textMain,
                      border: colors.borderCol,
                      padding: '6px 12px',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    title="بستن"
                    className="neo-btn"
                    style={{
                      backgroundColor: '#FF66C4',
                      color: '#000000',
                      padding: '6px 10px',
                      boxShadow: '2px 2px 0 #000000',
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  title={t.searchBtn}
                  className="neo-btn"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    border: colors.borderCol,
                    boxShadow: '2px 2px 0 ' + colors.shadow,
                    padding: '6px 12px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Search size={16} />
                  <span>{t.searchBtn}</span>
                </button>
              )}
            </div>

            {/* Right: Priority Filter & Sort Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Priority Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: colors.textMuted }}>
                  {t.filterLabel}
                </span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="neo-input"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    border: colors.borderCol,
                    padding: '6px 10px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">{t.allPriorities}</option>
                  <option value="HIGH">{t.highPriority}</option>
                  <option value="MEDIUM">{t.medPriority}</option>
                  <option value="LOW">{t.lowPriority}</option>
                </select>
              </div>

              {/* Sort By */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={14} color={colors.textMuted} />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: colors.textMuted }}>
                  {t.sortLabel}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="neo-input"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    border: colors.borderCol,
                    padding: '6px 10px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="created_desc">{t.sortByDateDesc}</option>
                  <option value="created_asc">{t.sortByDateAsc}</option>
                  <option value="due_date">{t.sortByDueDate}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#FFE600',
                color: '#000000',
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
                backgroundColor: colors.bgCard,
                border: colors.borderCol,
                boxShadow: colors.shadowCol,
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
                  color: '#000000',
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
                    fill={isDark ? '#1e293b' : '#FFFFFF'}
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
                  <line x1="68" y1="75" x2="126" y2="75" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />
                  <line x1="68" y1="95" x2="126" y2="95" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />
                  <line x1="68" y1="115" x2="110" y2="115" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />

                  {/* Friendly Playful Face */}
                  <circle cx="85" cy="95" r="4" fill={isDark ? '#ffffff' : '#000000'} />
                  <circle cx="109" cy="95" r="4" fill={isDark ? '#ffffff' : '#000000'} />
                  <path d="M91 106C94 110 100 110 103 106" stroke={isDark ? '#ffffff' : '#000000'} strokeWidth="3" strokeLinecap="round" />

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
                  color: colors.textMain,
                  margin: '0 0 10px',
                  lineHeight: '1.2',
                }}
              >
                {t.emptyTitle}
              </h2>

              <p
                style={{
                  fontSize: '17px',
                  color: colors.textMuted,
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
                  color: '#000000',
                  border: '3px solid #000000',
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
                    backgroundColor: isOver
                      ? isDark
                        ? '#1e293b'
                        : '#FFFBE6'
                      : colors.bgCard,
                    border: colors.borderCol,
                    boxShadow: isOver ? colors.shadowCol : colors.shadowBtn,
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
                      borderBottom: colors.borderCol,
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          backgroundColor: badgeBg,
                          color: '#000000',
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
                          backgroundColor: isDark ? '#38bdf8' : '#000000',
                          color: isDark ? '#000000' : '#FFFFFF',
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
                          backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                          color: colors.textMain,
                          border: colors.borderCol,
                          boxShadow: '2px 2px 0 ' + colors.shadow,
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
                          border: isDark ? '2.5px dashed #475569' : '2.5px dashed #A0AEC0',
                          borderRadius: '12px',
                          padding: '36px 16px',
                          textAlign: 'center',
                          color: colors.textMuted,
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
                              backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                              border: colors.borderCol,
                              boxShadow: '3px 3px 0 ' + colors.shadow,
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
                              e.currentTarget.style.boxShadow = '5px 5px 0 ' + colors.shadow;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = '3px 3px 0 ' + colors.shadow;
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
                                  color:
                                    task.status === 'DONE'
                                      ? colors.textMuted
                                      : colors.textMain,
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
                                    backgroundColor: isDark ? '#334155' : '#FFFFFF',
                                    color: colors.textMain,
                                    border: colors.borderCol,
                                    boxShadow: '2px 2px 0 ' + colors.shadow,
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>

                                {/* Only show trash icon if NOT in DONE column */}
                                {task.status !== 'DONE' && (
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    title="Delete"
                                    className="neo-btn"
                                    style={{
                                      padding: '4px 6px',
                                      backgroundColor: '#FF66C4',
                                      color: '#000000',
                                      border: '2px solid #000000',
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
                                  color: isDark ? '#cbd5e1' : '#374151',
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
                                borderTop: isDark ? '2px dashed #334155' : '2px dashed #E5E7EB',
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
                                    color: isDark ? '#94a3b8' : '#4B5563',
                                    backgroundColor: isDark ? '#334155' : '#F3F4F6',
                                    border: colors.borderCol,
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
                                    backgroundColor: isDark ? '#334155' : '#FFFFFF',
                                    color: colors.textMain,
                                    border: colors.borderCol,
                                    boxShadow: '2px 2px 0 ' + colors.shadow,
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
                                    color: '#000000',
                                    border: '2px solid #000000',
                                    boxShadow: '2px 2px 0 #000000',
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
              backgroundColor: colors.bgCard,
              border: colors.borderCol,
              boxShadow: colors.shadowCol,
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
                borderBottom: colors.borderCol,
                marginBottom: '18px',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: colors.textMain,
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
                  color: '#000000',
                  border: '2px solid #000000',
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
                  color: '#000000',
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
                    color: colors.textMain,
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
                  style={{
                    width: '100%',
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    border: colors.borderCol,
                  }}
                />
              </div>

              {/* 2. Description (Optional) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: colors.textMain,
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
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    border: colors.borderCol,
                  }}
                />
              </div>

              {/* 3. Priority Selector (Default is unselected / null!) */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: colors.textMuted,
                    marginBottom: '6px',
                  }}
                >
                  {t.priorityLabel}
                </span>

                {formData.priority ? (
                  /* Selected Priority Badge with ✕ remove button */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        backgroundColor: PRIORITY_THEME[formData.priority].bg,
                        color: PRIORITY_THEME[formData.priority].color,
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
                        title="Remove"
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
                    <span style={{ fontSize: '12px', color: colors.textMuted }}>
                      ({t.selectPriorityHint})
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
                            color: theme.color,
                            border: '2px solid #000000',
                            boxShadow: '2.5px 2.5px 0 #000000',
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

              {/* 4. Due Date (Cannot be in the past!) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: colors.textMain,
                    marginBottom: '6px',
                  }}
                >
                  {t.dueDateLabel}
                </label>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="date"
                    min={todayDateStr}
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="neo-input"
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                      color: colors.textMain,
                      border: colors.borderCol,
                    }}
                  />
                  {formData.due_date && (
                    <button
                      type="button"
                      onClick={() => setQuickDate(null)}
                      title="Clear"
                      className="neo-btn"
                      style={{
                        backgroundColor: '#FF66C4',
                        color: '#000000',
                        border: '2px solid #000000',
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
                      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                      color: colors.textMain,
                      border: colors.borderCol,
                      padding: '3px 10px',
                      fontSize: '12px',
                      boxShadow: '2px 2px 0 ' + colors.shadow,
                    }}
                  >
                    📅 {t.quickDates.today}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="neo-btn"
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                      color: colors.textMain,
                      border: colors.borderCol,
                      padding: '3px 10px',
                      fontSize: '12px',
                      boxShadow: '2px 2px 0 ' + colors.shadow,
                    }}
                  >
                    🚀 {t.quickDates.tomorrow}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="neo-btn"
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                      color: colors.textMain,
                      border: colors.borderCol,
                      padding: '3px 10px',
                      fontSize: '12px',
                      boxShadow: '2px 2px 0 ' + colors.shadow,
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
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    border: colors.borderCol,
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
                    color: '#000000',
                    border: '3px solid #000000',
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
