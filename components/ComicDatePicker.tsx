'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

export interface ComicDatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (dateStr: string) => void;
  minDate?: string; // "YYYY-MM-DD"
  lang: 'fa' | 'en';
  colors: {
    bgCard: string;
    textMain: string;
    textMuted: string;
    borderCol: string;
    shadowCol: string;
    shadowBtn: string;
  };
  isDark: boolean;
  isRTL: boolean;
}

// Persian month names
const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const GREGORIAN_MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const ENGLISH_WEEKDAYS = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

// Persian digit converter
export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[+w] ?? w);
}

// Gregorian to Jalali
export function gregorianToJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

// Jalali to Gregorian
export function jalaliToGregorian(jy: number, jm: number, jd: number) {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  const gd = days + 1;
  return { gy, gm, gd };
}

// Is Jalali year a leap year?
export function isJalaliLeap(jy: number): boolean {
  const g = jalaliToGregorian(jy, 12, 30);
  const j = gregorianToJalali(g.gy, g.gm, g.gd);
  return j.jd === 30 && j.jm === 12;
}

export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

export default function ComicDatePicker({
  value,
  onChange,
  minDate,
  lang,
  colors,
  isDark,
  isRTL,
}: ComicDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today reference
  const today = new Date();
  const todayG = { gy: today.getFullYear(), gm: today.getMonth() + 1, gd: today.getDate() };
  const todayJ = gregorianToJalali(todayG.gy, todayG.gm, todayG.gd);
  const todayIso = `${todayG.gy}-${String(todayG.gm).padStart(2, '0')}-${String(todayG.gd).padStart(2, '0')}`;

  // View state (Year and Month being navigated)
  const initialJ = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return gregorianToJalali(y, m, d);
  })() : todayJ;

  const [viewYear, setViewYear] = useState<number>(initialJ.jy);
  const [viewMonth, setViewMonth] = useState<number>(initialJ.jm);

  // Synchronize view when modal opens or value changes
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      const j = gregorianToJalali(y, m, d);
      setViewYear(j.jy);
      setViewMonth(j.jm);
    } else {
      setViewYear(todayJ.jy);
      setViewMonth(todayJ.jm);
    }
  }, [value, isOpen]);

  // Handle outside click to close popover
  useEffect(() => {
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

  // Navigate months
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Jump to today
  const handleJumpToToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewYear(todayJ.jy);
    setViewMonth(todayJ.jm);
    onChange(todayIso);
    setIsOpen(false);
  };

  // Calculate days for the calendar grid
  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth);

  // Day of week for the 1st of this Jalali month
  // We convert (viewYear, viewMonth, 1) to Gregorian, and getDay()
  const firstDayGreg = jalaliToGregorian(viewYear, viewMonth, 1);
  const firstDayDate = new Date(firstDayGreg.gy, firstDayGreg.gm - 1, firstDayGreg.gd);
  // In Persian calendar Saturday is 0: (getDay() + 1) % 7
  const startingDayOffset = (firstDayDate.getDay() + 1) % 7;

  // Selected date components
  const selectedJ = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return gregorianToJalali(y, m, d);
  })() : null;

  // Format display label for trigger
  const displayLabel = (() => {
    if (!value) return lang === 'fa' ? 'انتخاب تاریخ مهلت...' : 'Select due date...';
    if (lang === 'fa' && selectedJ) {
      return `${toPersianDigits(selectedJ.jd)} ${PERSIAN_MONTHS[selectedJ.jm - 1]} ${toPersianDigits(selectedJ.jy)}`;
    }
    const [y, m, d] = value.split('-').map(Number);
    return `${GREGORIAN_MONTHS_EN[m - 1]} ${d}, ${y}`;
  })();

  const selectDay = (day: number) => {
    const g = jalaliToGregorian(viewYear, viewMonth, day);
    const iso = `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
    onChange(iso);
    setIsOpen(false);
  };

  // Quick dates helper
  const setQuickDays = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const iso = d.toISOString().split('T')[0] ?? '';
    onChange(iso);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="neo-btn"
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '8px 14px',
          backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
          color: value ? colors.textMain : colors.textMuted,
          border: colors.borderCol,
          boxShadow: colors.shadowBtn,
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FFE600',
              border: '2px solid #000000',
              boxShadow: '1.5px 1.5px 0 #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              flexShrink: 0,
            }}
          >
            <Calendar size={17} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: value ? '16px' : '14px', fontWeight: value ? 900 : 700 }}>
            {displayLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              title={lang === 'fa' ? 'پاک کردن تاریخ' : 'Clear date'}
              style={{
                backgroundColor: '#FF66C4',
                border: '2px solid #000000',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#000000',
                padding: 0,
                boxShadow: '1.5px 1.5px 0 #000000',
              }}
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [isRTL ? 'right' : 'left']: 0,
            zIndex: 150,
            width: '100%',
            maxWidth: '340px',
            backgroundColor: isDark ? '#161e2e' : '#FFFFFF',
            border: isDark ? '2.5px solid #38bdf8' : '3px solid #000000',
            boxShadow: isDark ? '6px 6px 0 #38bdf8' : '6px 6px 0 #000000',
            borderRadius: '16px',
            padding: '16px',
            userSelect: 'none',
            animation: 'fadeInScale 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Calendar Header with Comic Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: isDark ? '2px dashed #334155' : '2px dashed #e2e8f0',
            }}
          >
            {/* Prev month button */}
            <button
              type="button"
              onClick={handlePrevMonth}
              title={lang === 'fa' ? 'ماه قبل' : 'Previous Month'}
              className="neo-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                color: colors.textMain,
                border: colors.borderCol,
                boxShadow: '2px 2px 0 ' + (isDark ? '#38bdf8' : '#000000'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isRTL ? <ChevronRight size={18} strokeWidth={2.5} /> : <ChevronLeft size={18} strokeWidth={2.5} />}
            </button>

            {/* Current Month & Year Badge */}
            <div
              style={{
                backgroundColor: '#FFE600',
                color: '#000000',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0 #000000',
                borderRadius: '10px',
                padding: '4px 14px',
                fontSize: '17px',
                fontWeight: 900,
                letterSpacing: '-0.3px',
              }}
            >
              {PERSIAN_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}
            </div>

            {/* Next month button */}
            <button
              type="button"
              onClick={handleNextMonth}
              title={lang === 'fa' ? 'ماه بعد' : 'Next Month'}
              className="neo-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                color: colors.textMain,
                border: colors.borderCol,
                boxShadow: '2px 2px 0 ' + (isDark ? '#38bdf8' : '#000000'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isRTL ? <ChevronLeft size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
            </button>
          </div>

          {/* Weekday Names Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontWeight: 900,
              fontSize: '13px',
              marginBottom: '8px',
              color: colors.textMuted,
            }}
          >
            {(lang === 'fa' ? PERSIAN_WEEKDAYS : ENGLISH_WEEKDAYS).map((day, idx) => (
              <div
                key={day}
                style={{
                  padding: '4px 0',
                  color: idx === 6 ? '#FF66C4' : colors.textMuted,
                  fontWeight: idx === 6 ? 900 : 700,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '5px',
            }}
          >
            {/* Empty slots before first day */}
            {Array.from({ length: startingDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '36px' }} />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const g = jalaliToGregorian(viewYear, viewMonth, day);
              const isoStr = `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;

              const isPast = minDate ? isoStr < minDate : false;
              const isToday = isoStr === todayIso;
              const isSelected = value === isoStr;

              // Comic Button Style based on states
              let bg = isDark ? '#1e293b' : '#FFFFFF';
              let textCol = colors.textMain;
              let border = isDark ? '1.5px solid #334155' : '1.5px solid #000000';
              let shadow = '1.5px 1.5px 0 ' + (isDark ? '#334155' : '#000000');
              let cursor = 'pointer';

              if (isSelected) {
                bg = '#FFE600';
                textCol = '#000000';
                border = '2.5px solid #000000';
                shadow = '3px 3px 0 #000000';
              } else if (isToday) {
                bg = isDark ? '#0f3a53' : '#E0F2FE';
                border = '2px solid #38BDF8';
                shadow = '2px 2px 0 #38BDF8';
                textCol = isDark ? '#38BDF8' : '#0284C7';
              }

              if (isPast) {
                cursor = 'not-allowed';
                bg = isDark ? '#111827' : '#f8fafc';
                textCol = isDark ? '#475569' : '#94a3b8';
                border = isDark ? '1px dashed #334155' : '1px dashed #cbd5e1';
                shadow = 'none';
              }

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && selectDay(day)}
                  className={!isPast ? 'neo-btn' : ''}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: bg,
                    color: textCol,
                    border,
                    boxShadow: shadow,
                    fontSize: '14px',
                    fontWeight: isSelected || isToday ? 900 : 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor,
                    padding: 0,
                    position: 'relative',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {toPersianDigits(day)}
                  {isToday && !isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: '#38BDF8',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts Footer */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              justifyContent: 'space-between',
              marginTop: '14px',
              paddingTop: '10px',
              borderTop: isDark ? '2px dashed #334155' : '2px dashed #e2e8f0',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleJumpToToday}
              className="neo-btn"
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '12px',
                fontWeight: 900,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                border: colors.borderCol,
                borderRadius: '8px',
                boxShadow: '1.5px 1.5px 0 ' + (isDark ? '#38bdf8' : '#000000'),
              }}
            >
              📅 {lang === 'fa' ? 'امروز' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setQuickDays(1)}
              className="neo-btn"
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '12px',
                fontWeight: 900,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                border: colors.borderCol,
                borderRadius: '8px',
                boxShadow: '1.5px 1.5px 0 ' + (isDark ? '#38bdf8' : '#000000'),
              }}
            >
              🚀 {lang === 'fa' ? 'فردا' : 'Tomorrow'}
            </button>
            <button
              type="button"
              onClick={() => setQuickDays(7)}
              className="neo-btn"
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '12px',
                fontWeight: 900,
                backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
                color: colors.textMain,
                border: colors.borderCol,
                borderRadius: '8px',
                boxShadow: '1.5px 1.5px 0 ' + (isDark ? '#38bdf8' : '#000000'),
              }}
            >
              🗓️ {lang === 'fa' ? 'هفته بعد' : 'Next Week'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
