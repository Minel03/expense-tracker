'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/navbar/Navbar';
import ExpenseTable from '@/components/expense-table/ExpenseTable';
import ExpenseForm from '@/components/expense-form/ExpenseForm';
import { getTransactions, getTransactionSummary } from '@/lib/transactions';
import { getCurrentUser } from '@/lib/auth';
import { generateFinancialInsights } from '@/lib/ai';
import { useTheme } from 'next-themes';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiPlus,
  FiActivity,
} from 'react-icons/fi';
import Link from 'next/link';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
);

const DashboardContent = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [aiData, setAiData] = useState({ insights: [], prediction: '', tips: [] });
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const searchParams = useSearchParams();
  const router = useRouter();
  const isAddingExpense = searchParams.get('add') === 'true';

  const fetchData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    setUser(currentUser);

    const { data: transData } = await getTransactions(currentUser.id);
    const { data: summData } = await getTransactionSummary(currentUser.id);

    setTransactions(transData || []);
    setSummary(summData || { income: 0, expense: 0, balance: 0 });

    if (transData && transData.length > 0) {
      const data = await generateFinancialInsights(
        transData,
        summData,
        currentUser.id,
      );
      setAiData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const expenseCategories = [
    ...new Set(expenseTransactions.map((t) => t.category)),
  ];

  const chartData = {
    labels: expenseCategories,
    datasets: [
      {
        data: expenseCategories.map((cat) =>
          expenseTransactions
            .filter((t) => t.category === cat)
            .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        ),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor:
          theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 1)',
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center transition-colors duration-300'>
        <div className='w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white pb-20 transition-colors duration-300 relative'>
      <Navbar />

      <main className='max-w-7xl mx-auto px-6 pt-32'>
        {/* Welcome Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12'>
          <div>
            <h1 className='text-4xl font-black tracking-tight mb-2'>
              Hello,{' '}
              <span className='text-violet-600 dark:text-violet-500'>
                {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
              </span>
            </h1>
            <p className='text-neutral-500 dark:text-neutral-400'>
              Here's your financial overview for this month.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl relative overflow-hidden group transition-all'>
            <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform'>
              <div className='w-32 h-32 flex items-center justify-center text-9xl font-mono font-black text-neutral-900 dark:text-white'>
                ₱
              </div>
            </div>
            <p className='text-neutral-500 dark:text-neutral-400 text-sm font-semibold mb-2 uppercase tracking-widest'>
              Total Balance
            </p>
            <h2 className='text-4xl font-mono font-black'>
              ₱{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl relative overflow-hidden group transition-all'>
            <div className='absolute top-0 right-0 p-4 opacity-10 text-emerald-600 dark:text-emerald-500 group-hover:scale-110 transition-transform'>
              <FiTrendingUp className='w-32 h-32' />
            </div>
            <p className='text-emerald-700/80 dark:text-emerald-500/80 text-sm font-semibold mb-2 uppercase tracking-widest'>
              Total Income
            </p>
            <h2 className='text-4xl font-mono font-black text-emerald-600 dark:text-emerald-400'>
              +₱{summary.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl relative overflow-hidden group transition-all'>
            <div className='absolute top-0 right-0 p-4 opacity-10 text-rose-600 dark:text-rose-500 group-hover:scale-110 transition-transform'>
              <FiTrendingDown className='w-32 h-32' />
            </div>
            <p className='text-rose-700/80 dark:text-rose-500/80 text-sm font-semibold mb-2 uppercase tracking-widest'>
              Total Expenses
            </p>
            <h2 className='text-4xl font-mono font-black text-rose-600 dark:text-rose-400'>
              -₱{summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Charts & Tables Section */}
          <div className='lg:col-span-2 space-y-8'>
            <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl transition-all'>
              <h3 className='text-xl font-bold mb-6 flex items-center gap-2'>
                <div className='w-1 h-6 bg-violet-600 dark:bg-violet-500 rounded-full'></div>
                Spending Distribution
              </h3>
              <div className='h-[300px] flex items-center justify-center'>
                {transactions.length > 0 ? (
                  <Doughnut
                    data={chartData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: theme === 'dark' ? '#9ca3af' : '#4b5563',
                          },
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <p className='text-neutral-500 italic'>No data to display</p>
                )}
              </div>
            </div>

            <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl transition-all'>
              <h3 className='text-xl font-bold mb-6 flex items-center gap-2'>
                <div className='w-1 h-6 bg-violet-600 dark:bg-violet-500 rounded-full'></div>
                Recent Transactions
              </h3>
              <ExpenseTable
                transactions={transactions}
                onUpdate={fetchData}
              />
            </div>
          </div>

          {/* Analysis Side Panel (Less "AI" focused) */}
          <div className='space-y-8'>
            <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl relative overflow-hidden transition-all'>
              <h3 className='text-xl font-bold mb-6 flex items-center gap-2'>
                <FiActivity className='text-neutral-400' />
                Smart Analysis
              </h3>
              <div className='space-y-3'>
                {aiData?.insights?.length > 0 ? (
                  aiData.insights.map((insight, i) => (
                    <div
                      key={i}
                      className='p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 animate-in fade-in slide-in-from-right-4 duration-500'
                      style={{ delay: `${i * 100}ms` }}>
                      {insight}
                    </div>
                  ))
                ) : (
                  <div className='p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 text-sm text-neutral-500 italic'>
                    Analysis is currently generating...
                  </div>
                )}
              </div>
            </div>

            <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl transition-all'>
              <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
                <FiPieChart className='text-neutral-400' />
                Quick Tips
              </h3>
              {aiData?.tips?.length > 0 ? (
                <ul className='text-sm text-neutral-600 dark:text-neutral-400 space-y-3'>
                  {aiData.tips.map((tip, i) => (
                    <li key={i} className='flex items-start gap-2'>
                      <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0'></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-neutral-500 italic'>Generating personalized tips...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Overlay for Add Transaction */}
      {isAddingExpense && (
        <ExpenseForm
          userId={user?.id}
          onSuccess={fetchData}
          onClose={() => router.push('/dashboard')}
        />
      )}
    </div>
  );
};

const Dashboard = () => {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center transition-colors duration-300'>
          <div className='w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
      }>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;
