"use client";
import React, { useState } from 'react';
import { deleteTransaction, updateTransaction, getReceiptUrl } from '@/lib/transactions';
import { toast } from 'react-hot-toast';
import {
  FiTrash2, FiTrendingUp, FiTrendingDown, FiSearch,
  FiChevronLeft, FiChevronRight, FiX, FiPaperclip,
  FiCalendar, FiTag, FiAlignLeft, FiExternalLink,
  FiEdit2, FiSave
} from 'react-icons/fi';

const categories = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Utilities',
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Travel', 'Other'
];

// ─── Transaction Detail Modal ────────────────────────────────────────────────
const TransactionDetailModal = ({ transaction: t, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state — pre-filled with current transaction values
  const [editType, setEditType] = useState(t.type);
  const [editAmount, setEditAmount] = useState(t.amount);
  const [editCategory, setEditCategory] = useState(t.category);
  const [editDescription, setEditDescription] = useState(t.description || '');
  const [editDate, setEditDate] = useState(t.date);

  const formatAmount = (amount) =>
    parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleViewReceipt = async () => {
    if (receiptUrl) { setReceiptUrl(null); return; }
    setLoadingReceipt(true);
    const { url, error } = await getReceiptUrl(t.receipt_url);
    setLoadingReceipt(false);
    if (error) { toast.error('Could not load receipt.'); return; }
    setReceiptUrl(url);
  };

  const handleDelete = async () => {
    const { error } = await deleteTransaction(t.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Transaction deleted');
    onClose();
    if (onDelete) onDelete();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editAmount || isNaN(editAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSaving(true);
    const { error } = await updateTransaction(t.id, {
      type: editType,
      amount: parseFloat(editAmount),
      category: editCategory,
      description: editDescription,
      date: editDate,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Transaction updated!');
    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setEditType(t.type);
    setEditAmount(t.amount);
    setEditCategory(t.category);
    setEditDescription(t.description || '');
    setEditDate(t.date);
    setIsEditing(false);
  };

  const isIncome = isEditing ? editType === 'income' : t.type === 'income';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => { if (!isEditing) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-white/10 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className={`p-6 transition-colors duration-300 ${isIncome ? 'bg-emerald-500/10 dark:bg-emerald-500/5' : 'bg-rose-500/10 dark:bg-rose-500/5'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              {isEditing ? (
                /* Edit mode header — type toggle */
                <div className="flex bg-white/60 dark:bg-black/20 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setEditType('expense')}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${editType === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                  >Expense</button>
                  <button
                    type="button"
                    onClick={() => setEditType('income')}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${editType === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                  >Income</button>
                </div>
              ) : (
                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full ${isIncome ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                  {t.type}
                </span>
              )}

              {isEditing ? (
                /* Editable amount */
                <div className="relative mt-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-lg">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-2xl font-mono font-black text-neutral-900 dark:text-white"
                    required
                  />
                </div>
              ) : (
                <h2 className="text-3xl font-mono font-black mt-3 text-neutral-900 dark:text-white">
                  {isIncome ? '+' : '-'}₱{formatAmount(t.amount)}
                </h2>
              )}
            </div>

            {/* Action buttons: Edit / Close */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isEditing && (
                <button
                  onClick={() => { setConfirmDelete(false); setIsEditing(true); }}
                  className="p-2 text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10 rounded-full transition-colors"
                  title="Edit Transaction"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={isEditing ? handleCancelEdit : onClose}
                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full transition-colors"
                title={isEditing ? 'Cancel' : 'Close'}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">

            {/* Description */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-xl mt-0.5 flex-shrink-0">
                <FiAlignLeft className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Description</p>
                {isEditing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="What was this for?"
                    rows={2}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm text-neutral-900 dark:text-white resize-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">
                    {t.description || <span className="italic text-neutral-400">No description</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-xl mt-0.5 flex-shrink-0">
                <FiTag className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Category</p>
                {isEditing ? (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm text-neutral-900 dark:text-white cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-neutral-800">{cat}</option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10">
                    {t.category}
                  </span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-xl mt-0.5 flex-shrink-0">
                <FiCalendar className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Date</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm text-neutral-900 dark:text-white"
                    required
                  />
                ) : (
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mt-0.5">
                    {new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Receipt (view-only, not editable) */}
            {t.receipt_url && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-xl mt-0.5 flex-shrink-0">
                  <FiPaperclip className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Receipt</p>
                  <button
                    type="button"
                    onClick={handleViewReceipt}
                    disabled={loadingReceipt}
                    className="mt-1 flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    {loadingReceipt ? 'Loading...' : receiptUrl ? 'Hide Receipt' : 'View Receipt'}
                  </button>
                  {receiptUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10">
                      <img src={receiptUrl} alt="Transaction Receipt" className="w-full max-h-56 object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 space-y-3">
            {isEditing ? (
              /* Save / Cancel buttons */
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20 disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              /* Delete button with confirmation guard */
              confirmDelete ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-white/10 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                  >Cancel</button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-600/20"
                  >Yes, Delete</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-sm font-semibold transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Transaction
                </button>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main ExpenseTable ────────────────────────────────────────────────────────
const ExpenseTable = ({ transactions, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const itemsPerPage = 5;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatAmount = (amount) =>
    parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 dark:bg-white/5 rounded-3xl border border-dashed border-neutral-200 dark:border-white/20">
        <p className="text-neutral-500 italic">No transactions found. Add one to get started!</p>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      (t.description && t.description.toLowerCase().includes(term)) ||
      (t.category && t.category.toLowerCase().includes(term)) ||
      t.amount.toString().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onDelete={() => { setSelectedTransaction(null); if (onUpdate) onUpdate(); }}
          onUpdate={() => { setSelectedTransaction(null); if (onUpdate) onUpdate(); }}
        />
      )}

      <div className="w-full bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col">

        {/* Search Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-white/5">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all text-sm text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <p className="text-neutral-500 italic">No matching transactions found.</p>
          </div>
        ) : (
          <>
            {/* Mobile Layout: Stacked Cards */}
            <div className="md:hidden divide-y divide-neutral-100 dark:divide-white/5">
              {paginatedTransactions.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTransaction(t)}
                  className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{t.description || 'No description'}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-mono font-bold flex items-center gap-1 ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}₱{formatAmount(t.amount)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10">
                      {t.category}
                    </span>
                    {t.receipt_url && (
                      <span className="px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-[10px] font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1">
                        <FiPaperclip className="w-3 h-3" /> Receipt
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                  {paginatedTransactions.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTransaction(t)}
                      className="hover:bg-violet-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {t.description || 'No description'}
                          </p>
                          {t.receipt_url && (
                            <FiPaperclip className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 font-mono font-bold ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {t.type === 'income' ? <FiTrendingUp /> : <FiTrendingDown />}
                          {t.type === 'income' ? '+' : '-'}₱{formatAmount(t.amount)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.02]">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ExpenseTable;
