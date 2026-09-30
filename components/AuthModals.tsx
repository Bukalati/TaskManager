'use client';

import React, { useState, useRef } from 'react';
import {
  User,
  Lock,
  Mail,
  Shield,
  Upload,
  LogOut,
  KeyRound,
  X,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Users,
  ChevronDown,
  Camera,
  Check,
} from 'lucide-react';
import type { UserSummary } from '@/types/task';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSummary) => void;
  lang: 'fa' | 'en';
  colors: any;
  isDark: boolean;
  isRTL: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  lang,
  colors,
  isDark,
  isRTL,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ورود به حساب');
      }
      onLoginSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت نام');
      }
      onLoginSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در بازیابی رمز');
      }
      setMessage(data.data?.message || 'درخواست با موفقیت ثبت شد');
      if (newPassword) {
        setTimeout(() => setTab('login'), 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fill quick demo credentials
  const fillDemoCreds = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgCard,
          border: isDark ? '2.5px solid #38bdf8' : '3px solid #000000',
          boxShadow: isDark ? '8px 8px 0 #38bdf8' : '8px 8px 0 #000000',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          padding: '24px',
          position: 'relative',
        }}
      >
        {/* Header Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
                setMessage(null);
              }}
              className="neo-btn"
              style={{
                backgroundColor: tab === 'login' ? '#FFE600' : isDark ? '#1e293b' : '#f1f5f9',
                color: tab === 'login' ? '#000000' : colors.textMain,
                border: '2px solid #000000',
                boxShadow: tab === 'login' ? '2.5px 2.5px 0 #000000' : 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '14px',
                fontWeight: 900,
              }}
            >
              {lang === 'fa' ? 'ورود' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
                setMessage(null);
              }}
              className="neo-btn"
              style={{
                backgroundColor: tab === 'register' ? '#4EFA8A' : isDark ? '#1e293b' : '#f1f5f9',
                color: tab === 'register' ? '#000000' : colors.textMain,
                border: '2px solid #000000',
                boxShadow: tab === 'register' ? '2.5px 2.5px 0 #000000' : 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '14px',
                fontWeight: 900,
              }}
            >
              {lang === 'fa' ? 'ثبت‌نام' : 'Register'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="neo-btn"
            style={{
              backgroundColor: '#FF66C4',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Error / Success alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#FF66C4',
              color: '#000000',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0 #000000',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              backgroundColor: '#4EFA8A',
              color: '#000000',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0 #000000',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
                {lang === 'fa' ? 'ایمیل:' : 'Email:'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@taskflow.local"
                  className="neo-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: colors.borderCol,
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    color: colors.textMain,
                    boxSizing: 'border-box',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 900 }}>
                  {lang === 'fa' ? 'رمز عبور:' : 'Password:'}
                </label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {lang === 'fa' ? 'فراموشی رمز؟' : 'Forgot?'}
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="neo-input"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: colors.borderCol,
                  backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn"
              style={{
                backgroundColor: '#FFE600',
                color: '#000000',
                border: '2.5px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              {loading ? (lang === 'fa' ? 'در حال ورود...' : 'Logging in...') : (lang === 'fa' ? 'ورود به حساب' : 'Log In')}
            </button>

            {/* Quick Demo Credentials for Convenience */}
            <div
              style={{
                marginTop: '12px',
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                border: isDark ? '1px dashed #334155' : '1px dashed #cbd5e1',
                fontSize: '12px',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '6px', color: colors.textMuted }}>
                {lang === 'fa' ? '🚀 حساب‌های تستی آماده (کلیک کنید):' : '🚀 Quick Demo Accounts (Click to fill):'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fillDemoCreds('admin@taskflow.local', 'Admin@123456')}
                  className="neo-btn"
                  style={{
                    backgroundColor: '#FFE600',
                    color: '#000000',
                    border: '1.5px solid #000000',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 900,
                  }}
                >
                  👑 مدیر اصلی (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCreds('sara@taskflow.local', 'Sara@123456')}
                  className="neo-btn"
                  style={{
                    backgroundColor: '#FF66C4',
                    color: '#000000',
                    border: '1.5px solid #000000',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 900,
                  }}
                >
                  👩 سارا محمدی
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCreds('ali@taskflow.local', 'Ali@123456')}
                  className="neo-btn"
                  style={{
                    backgroundColor: '#38BDF8',
                    color: '#000000',
                    border: '1.5px solid #000000',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 900,
                  }}
                >
                  👨 علی کریمی
                </button>
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
                {lang === 'fa' ? 'نام و نام خانوادگی:' : 'Full Name:'}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={lang === 'fa' ? 'مثلاً: رضا رضایی' : 'John Doe'}
                className="neo-input"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: colors.borderCol,
                  backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
                {lang === 'fa' ? 'ایمیل:' : 'Email:'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="neo-input"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: colors.borderCol,
                  backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
                {lang === 'fa' ? 'رمز عبور (حداقل ۶ کاراکتر):' : 'Password (min 6 chars):'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="neo-input"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: colors.borderCol,
                  backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn"
              style={{
                backgroundColor: '#4EFA8A',
                color: '#000000',
                border: '2.5px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              {loading ? (lang === 'fa' ? 'در حال ایجاد حساب...' : 'Registering...') : (lang === 'fa' ? 'ساخت حساب کاربری' : 'Create Account')}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
                {lang === 'fa' ? 'ایمیل حساب کاربری:' : 'Account Email:'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="neo-input"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: colors.borderCol,
                  backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
                {lang === 'fa' ? 'رمز عبور جدید:' : 'New Password:'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="neo-input"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: colors.borderCol,
                  backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                  color: colors.textMain,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn"
              style={{
                backgroundColor: '#38BDF8',
                color: '#000000',
                border: '2.5px solid #000000',
                boxShadow: '4px 4px 0 #000000',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              {loading ? (lang === 'fa' ? 'در حال ثبت...' : 'Submitting...') : (lang === 'fa' ? 'بازنشانی رمز عبور' : 'Reset Password')}
            </button>

            <button
              type="button"
              onClick={() => setTab('login')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textMuted,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline',
              }}
            >
              {lang === 'fa' ? 'بازگشت به فرم ورود' : 'Back to Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PROFILE MODAL (View, Edit Name, Upload Avatar)
// -------------------------------------------------------------
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSummary | null;
  onUpdateUser: (updated: UserSummary) => void;
  onOpenChangePassword: () => void;
  lang: 'fa' | 'en';
  colors: any;
  isDark: boolean;
  isRTL?: boolean;
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenChangePassword,
  lang,
  colors,
  isDark,
  isRTL,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Handle local image file upload & convert to compact data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(lang === 'fa' ? 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد' : 'Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در ذخیره پروفایل');
      onUpdateUser(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgCard,
          border: isDark ? '2.5px solid #38bdf8' : '3px solid #000000',
          boxShadow: isDark ? '8px 8px 0 #38bdf8' : '8px 8px 0 #000000',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            borderBottom: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={22} color="#FFE600" />
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>
              {lang === 'fa' ? 'پروفایل کاربری' : 'User Profile'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="neo-btn"
            style={{
              backgroundColor: '#FF66C4',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar Upload Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0 #000000',
                backgroundColor: '#FFE600',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#000000' }}>
                  {user.full_name.charAt(0) || '👤'}
                </span>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="neo-btn"
                style={{
                  backgroundColor: '#38BDF8',
                  color: '#000000',
                  border: '2px solid #000000',
                  boxShadow: '2.5px 2.5px 0 #000000',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  marginBottom: '6px',
                }}
              >
                <Camera size={15} />
                <span>{lang === 'fa' ? 'تغییر تصویر آواتار' : 'Change Avatar'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF66C4',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {lang === 'fa' ? 'حذف آواتار' : 'Remove Avatar'}
                </button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
              {lang === 'fa' ? 'نام و نام خانوادگی:' : 'Full Name:'}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="neo-input"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: colors.borderCol,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Email (Readonly) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '6px' }}>
              {lang === 'fa' ? 'ایمیل:' : 'Email:'}
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px dashed ' + (isDark ? '#334155' : '#cbd5e1'),
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                color: colors.textMuted,
                boxSizing: 'border-box',
                fontSize: '14px',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Role Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: colors.textMuted }}>
              {lang === 'fa' ? 'نقش کاربری:' : 'Role:'}
            </span>
            <span
              style={{
                backgroundColor: user.role === 'admin' ? '#FFE600' : '#4EFA8A',
                color: '#000000',
                border: '1.5px solid #000000',
                boxShadow: '1.5px 1.5px 0 #000000',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 900,
              }}
            >
              {user.role === 'admin' ? (lang === 'fa' ? '👑 مدیر ارشد (Admin)' : 'Admin') : (lang === 'fa' ? '👤 عضو عادی (Member)' : 'Member')}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChangePassword();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <KeyRound size={15} />
              <span>{lang === 'fa' ? 'تغییر رمز عبور' : 'Change Password'}</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn"
              style={{
                backgroundColor: saved ? '#4EFA8A' : '#FFE600',
                color: '#000000',
                border: '2.5px solid #000000',
                boxShadow: '3px 3px 0 #000000',
                borderRadius: '10px',
                padding: '8px 20px',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {saved && <Check size={16} />}
              <span>{saved ? (lang === 'fa' ? 'ذخیره شد!' : 'Saved!') : (lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CHANGE PASSWORD MODAL
// -------------------------------------------------------------
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
  colors: any;
  isDark: boolean;
  isRTL?: boolean;
}

export function ChangePasswordModal({ isOpen, onClose, lang, colors, isDark, isRTL }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(lang === 'fa' ? 'تکرار رمز عبور جدید مطابقت ندارد' : 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError(lang === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در تغییر رمز');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 210,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgCard,
          border: isDark ? '2.5px solid #38bdf8' : '3px solid #000000',
          boxShadow: isDark ? '8px 8px 0 #38bdf8' : '8px 8px 0 #000000',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
            paddingBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} color="#FF66C4" />
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>
              {lang === 'fa' ? 'تغییر رمز عبور' : 'Change Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="neo-btn"
            style={{
              backgroundColor: '#FF66C4',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              boxShadow: '1.5px 1.5px 0 #000000',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FF66C4',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '14px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: '#4EFA8A',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '14px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            {lang === 'fa' ? 'رمز عبور با موفقیت تغییر کرد!' : 'Password changed successfully!'}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '4px' }}>
              {lang === 'fa' ? 'رمز عبور فعلی:' : 'Current Password:'}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="neo-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: colors.borderCol,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '4px' }}>
              {lang === 'fa' ? 'رمز عبور جدید:' : 'New Password:'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="neo-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: colors.borderCol,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '4px' }}>
              {lang === 'fa' ? 'تکرار رمز عبور جدید:' : 'Confirm New Password:'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="neo-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: colors.borderCol,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neo-btn"
            style={{
              backgroundColor: '#FFE600',
              color: '#000000',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0 #000000',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? (lang === 'fa' ? 'در حال تغییر...' : 'Updating...') : (lang === 'fa' ? 'ثبت رمز جدید' : 'Update Password')}
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// ADMIN USERS & ROLE MANAGEMENT MODAL
// -------------------------------------------------------------
interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  lang: 'fa' | 'en';
  colors: any;
  isDark: boolean;
  isRTL?: boolean;
}

export function AdminUsersModal({ isOpen, onClose, currentUserId, lang, colors, isDark, isRTL }: AdminUsersModalProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const json = await res.json();
      if (res.ok) {
        setUsers(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (targetUser: UserSummary) => {
    const newRole = targetUser.role === 'admin' ? 'member' : 'admin';
    setUpdatingId(targetUser.id);
    try {
      const res = await fetch(`/api/auth/users/${targetUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
      } else {
        const err = await res.json();
        alert(err.error || 'خطا در تغییر نقش');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgCard,
          border: isDark ? '2.5px solid #38bdf8' : '3px solid #000000',
          boxShadow: isDark ? '8px 8px 0 #38bdf8' : '8px 8px 0 #000000',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} color="#FFE600" />
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>
              {lang === 'fa' ? 'مدیریت کاربران و سطح دسترسی‌ها' : 'User Management & Roles'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="neo-btn"
            style={{
              backgroundColor: '#FF66C4',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 16px' }}>
          {lang === 'fa'
            ? 'به عنوان مدیر سیستم می‌توانید نقش اعضا را به «مدیر» یا «عضو عادی» ارتقا یا تنزل دهید.'
            : 'As an administrator, you can promote or demote user roles between Admin and Member.'}
        </p>

        {/* Users List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', fontWeight: 800 }}>
              {lang === 'fa' ? 'در حال دریافت لیست کاربران...' : 'Loading users...'}
            </div>
          ) : (
            users.map((u) => {
              const isAdmin = u.role === 'admin';
              const isPrimaryAdmin = u.id === 'a0000000-0000-0000-0000-000000000001';

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                    border: colors.borderCol,
                    boxShadow: '2px 2px 0 ' + (isDark ? '#38bdf8' : '#000000'),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isAdmin ? '#FFE600' : '#4EFA8A',
                        border: '2px solid #000000',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        color: '#000000',
                        flexShrink: 0,
                      }}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        u.full_name.charAt(0) || '👤'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{u.full_name}</span>
                        {isAdmin && <Crown size={14} color="#FFE600" />}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>{u.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={isPrimaryAdmin || updatingId === u.id}
                      onClick={() => handleToggleRole(u)}
                      className={!isPrimaryAdmin ? 'neo-btn' : ''}
                      style={{
                        backgroundColor: isAdmin ? '#FFE600' : '#E2E8F0',
                        color: '#000000',
                        border: '2px solid #000000',
                        boxShadow: !isPrimaryAdmin ? '2px 2px 0 #000000' : 'none',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 900,
                        cursor: isPrimaryAdmin ? 'not-allowed' : 'pointer',
                        opacity: isPrimaryAdmin ? 0.7 : 1,
                      }}
                    >
                      {isPrimaryAdmin
                        ? (lang === 'fa' ? 'مدیر اصلی (ثابت)' : 'Primary Admin')
                        : isAdmin
                        ? (lang === 'fa' ? '👑 مدیر' : 'Admin')
                        : (lang === 'fa' ? '👤 عضو عادی' : 'Member')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// USER HEADER MENU (Avatar + Dropdown)
// -------------------------------------------------------------
interface UserHeaderMenuProps {
  user: UserSummary | null;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
  lang: 'fa' | 'en';
  colors: any;
  isDark: boolean;
  isRTL: boolean;
}

export function UserHeaderMenu({
  user,
  onOpenLogin,
  onOpenProfile,
  onOpenAdminModal,
  onLogout,
  lang,
  colors,
  isDark,
  isRTL,
}: UserHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenLogin}
        className="neo-btn"
        style={{
          height: '42px',
          padding: '0 16px',
          backgroundColor: '#FFE600',
          color: '#000000',
          border: '2.5px solid #000000',
          boxShadow: isDark ? '3px 3px 0 #38bdf8' : '3px 3px 0 #000000',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <User size={18} strokeWidth={2.5} />
        <span>{lang === 'fa' ? 'ورود / ثبت‌نام' : 'Login / Register'}</span>
      </button>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-btn"
        style={{
          height: '42px',
          padding: '0 12px',
          backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
          color: colors.textMain,
          border: colors.borderCol,
          boxShadow: colors.shadowBtn,
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: isAdmin ? '#FFE600' : '#4EFA8A',
            border: '2px solid #000000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 900,
            color: '#000000',
            flexShrink: 0,
          }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user.full_name.charAt(0) || '👤'
          )}
        </div>

        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.full_name}
        </span>

        {isAdmin && <Crown size={14} color="#FFE600" />}

        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [isRTL ? 'right' : 'left']: 0,
            zIndex: 150,
            minWidth: '220px',
            backgroundColor: isDark ? '#161e2e' : '#FFFFFF',
            border: isDark ? '2.5px solid #38bdf8' : '3px solid #000000',
            boxShadow: isDark ? '6px 6px 0 #38bdf8' : '6px 6px 0 #000000',
            borderRadius: '14px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'fadeInScale 0.15s ease',
          }}
        >
          {/* User Info Tile */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: isDark ? '1px dashed #334155' : '1px dashed #cbd5e1',
              marginBottom: '4px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 900, color: colors.textMain }}>{user.full_name}</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>{user.email}</div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenProfile();
            }}
            className="neo-btn"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: colors.textMain,
              textAlign: isRTL ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <User size={16} />
            <span>{lang === 'fa' ? 'پروفایل من' : 'My Profile'}</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAdminModal();
              }}
              className="neo-btn"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: colors.textMain,
                textAlign: isRTL ? 'right' : 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Users size={16} />
              <span>{lang === 'fa' ? 'مدیریت کاربران (ادمین)' : 'User Management'}</span>
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: isDark ? '#334155' : '#e2e8f0', margin: '4px 0' }} />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="neo-btn"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDark ? '#3f1a28' : '#ffe4e6',
              color: '#e11d48',
              textAlign: isRTL ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            <span>{lang === 'fa' ? 'خروج از حساب' : 'Log Out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
