"use client";
import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TransactionCalendar = ({ transactions = [] }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const formatAmount = (amount) =>
    parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Build a map of date string → transactions for O(1) lookup
  const transactionMap = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      // Normalize the date key to YYYY-MM-DD
      const key = t.date.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [transactions]);

  // Transactions for the selected date
  const selectedTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactionMap[selectedDate] || [];
  }, [selectedDate, transactionMap]);

  // Navigate months
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells = [];
  // Leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(dateStr);
  }

  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  // Summary for selected day
  const selectedIncome = selectedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const selectedExpense = selectedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 rounded-3xl transition-all overflow-hidden'>
      {/* Calendar Header */}
      <div className='p-6 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between'>
        <h3 className='text-xl font-bold flex items-center gap-2'>
          <div className='w-1 h-6 bg-violet-600 dark:bg-violet-500 rounded-full'></div>
          Transaction Calendar
        </h3>
        <div className='flex items-center gap-3'>
          <button
            onClick={prevMonth}
            className='p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 transition-colors'
          >
            <FiChevronLeft className='w-5 h-5' />
          </button>
          <span className='text-base font-semibold text-neutral-800 dark:text-white min-w-[140px] text-center'>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className='p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 transition-colors'
          >
            <FiChevronRight className='w-5 h-5' />
          </button>
        </div>
      </div>

      <div className='p-4 md:p-6'>
        {/* Day Labels */}
        <div className='grid grid-cols-7 mb-2'>
          {DAYS.map(d => (
            <div key={d} className='text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase py-2'>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className='grid grid-cols-7 gap-1'>
          {cells.map((dateStr, idx) => {
            if (!dateStr) return <div key={`empty-${idx}`} />;

            const dayTxns = transactionMap[dateStr] || [];
            const hasIncome = dayTxns.some(t => t.type === 'income');
            const hasExpense = dayTxns.some(t => t.type === 'expense');
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayNum = parseInt(dateStr.split('-')[2]);

            return (
              <button
                key={dateStr}
                onClick={() => dayTxns.length > 0 && handleDayClick(dateStr)}
                className={`
                  relative flex flex-col items-center justify-start p-1 md:p-2 rounded-xl min-h-[44px] md:min-h-[56px] transition-all
                  ${dayTxns.length > 0 ? 'cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-500/10' : 'cursor-default'}
                  ${isSelected ? 'bg-violet-100 dark:bg-violet-500/20 ring-1 ring-violet-500 dark:ring-violet-400' : ''}
                  ${isToday && !isSelected ? 'bg-neutral-100 dark:bg-white/10' : ''}
                `}
              >
                <span className={`text-xs md:text-sm font-semibold
                  ${isToday ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-700 dark:text-neutral-300'}
                  ${isSelected ? 'text-violet-700 dark:text-violet-300 font-bold' : ''}
                `}>
                  {dayNum}
                </span>
                {/* Transaction dots */}
                {(hasIncome || hasExpense) && (
                  <div className='flex gap-0.5 mt-1'>
                    {hasIncome && <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400'></span>}
                    {hasExpense && <span className='w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400'></span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className='flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-white/5'>
          <div className='flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400'>
            <span className='w-2 h-2 rounded-full bg-emerald-500'></span> Income
          </div>
          <div className='flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400'>
            <span className='w-2 h-2 rounded-full bg-rose-500'></span> Expense
          </div>
          <div className='flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400'>
            <span className='w-4 h-4 rounded-md bg-neutral-100 dark:bg-white/10 inline-block'></span> Today
          </div>
        </div>
      </div>

      {/* Selected Day Transactions Panel */}
      {selectedDate && selectedTransactions.length > 0 && (
        <div className='border-t border-neutral-100 dark:border-white/5 p-4 md:p-6 bg-neutral-50/50 dark:bg-white/[0.02] animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h4 className='font-bold text-neutral-900 dark:text-white'>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h4>
              <div className='flex gap-4 mt-1'>
                {selectedIncome > 0 && (
                  <span className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold'>
                    +₱{formatAmount(selectedIncome)} income
                  </span>
                )}
                {selectedExpense > 0 && (
                  <span className='text-xs text-rose-600 dark:text-rose-400 font-semibold'>
                    -₱{formatAmount(selectedExpense)} expenses
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className='p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors'
            >
              <FiX className='w-4 h-4' />
            </button>
          </div>

          <div className='space-y-2'>
            {selectedTransactions.map((t) => (
              <div key={t.id} className='flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-white/10'>
                <div className='flex items-center gap-3'>
                  <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-rose-100 dark:bg-rose-500/10'}`}>
                    {t.type === 'income'
                      ? <FiTrendingUp className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                      : <FiTrendingDown className='w-4 h-4 text-rose-600 dark:text-rose-400' />}
                  </div>
                  <div>
                    <p className='text-sm font-medium text-neutral-900 dark:text-white'>
                      {t.description || 'No description'}
                    </p>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'>
                      {t.category}
                    </span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}₱{formatAmount(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCalendar;
