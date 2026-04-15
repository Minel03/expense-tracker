import React, { useState } from 'react';
import { FiTarget, FiEdit2, FiSave, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { upsertBudget, deleteBudget } from '@/lib/transactions';
import { toast } from 'react-hot-toast';

const categories = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Utilities',
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Travel', 'Other'
];

export default function BudgetTracker({ budgets, transactions, userId, month, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState('Food');
  const [editAmount, setEditAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Calculate spending per category
  const expenses = transactions.filter(t => t.type === 'expense');
  const spendingByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
    return acc;
  }, {});

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!editAmount || isNaN(editAmount)) return toast.error('Enter valid amount');
    setSaving(true);
    const { error } = await upsertBudget({
      user_id: userId,
      category: editCategory,
      amount: parseFloat(editAmount),
      month: month
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Budget saved');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    }
  };

  const handleEditClick = (b) => {
    setEditCategory(b.category);
    setEditAmount(b.amount);
    setIsEditing(true);
  };

  const handleDeleteClick = async (id) => {
    if (!confirm("Are you sure you want to remove this budget goal?")) return;
    const { error } = await deleteBudget(id);
    if (error) return toast.error("Failed to delete budget limit.");
    toast.success("Budget limit deleted.");
    if (onUpdate) onUpdate();
  };

  return (
    <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl relative overflow-hidden transition-all'>
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
        <h3 className='text-xl font-bold flex items-center gap-2'>
          <FiTarget className='text-neutral-400' />
          Budget Goals
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          {isEditing ? 'Cancel' : <><FiEdit2 /> Set Budget</>}
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSaveBudget} className="mb-6 bg-neutral-50 dark:bg-black/20 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <select 
              value={editCategory} 
              onChange={e => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-sm outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              type="number" 
              placeholder="Amount" 
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-sm outline-none"
              required
            />
          </div>
          <button 
            disabled={saving} 
            className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Limit'}
          </button>
        </form>
      )}

      <div className='space-y-4 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full'>
        {budgets.length > 0 ? (
          budgets.map(b => {
            const spent = spendingByCategory[b.category] || 0;
            const threshold = parseFloat(b.amount);
            const percentage = Math.min((spent / threshold) * 100, 100).toFixed(0);
            const isOver = spent > threshold;
            const isWarning = spent > threshold * 0.8 && !isOver;

            return (
              <div key={b.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 space-y-2 group">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{b.category}</span>
                    <div className="flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
                      <button onClick={() => handleEditClick(b)} className="p-1.5 text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-white/10 shadow-sm" title="Edit Budget">
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteClick(b.id)} className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-white/10 shadow-sm" title="Delete Budget">
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono self-start sm:self-auto">₱{spent.toLocaleString()} / ₱{threshold.toLocaleString()}</span>
                </div>
                
                <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isOver ? 'bg-rose-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'} transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                {(isOver || isWarning) && (
                  <p className={`text-xs flex items-center gap-1 font-medium ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    <FiAlertTriangle />
                    {isOver ? `You are ${((spent/threshold)*100 - 100).toFixed(0)}% over budget based on your limit!` : `You are at ${percentage}% of your budget!`}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-neutral-500 italic">No budget limits set. Keep spending in check by setting limits.</p>
        )}
      </div>
    </div>
  );
}
