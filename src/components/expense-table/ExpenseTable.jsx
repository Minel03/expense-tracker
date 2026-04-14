"use client";
import React, { useState, useEffect } from 'react';
import { deleteTransaction } from '@/lib/transactions';
import { toast } from 'react-hot-toast';
import { FiTrash2, FiTrendingUp, FiTrendingDown, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ExpenseTable = ({ transactions, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    const { error } = await deleteTransaction(id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Transaction deleted');
      if (onUpdate) onUpdate();
    }
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 dark:bg-white/5 rounded-3xl border border-dashed border-neutral-200 dark:border-white/20">
        <p className="text-neutral-500 italic">No transactions found. Add one to get started!</p>
      </div>
    );
  }

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      (t.description && t.description.toLowerCase().includes(term)) ||
      (t.category && t.category.toLowerCase().includes(term)) ||
      t.amount.toString().includes(term)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
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
              <div key={t.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors relative group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{t.description || 'No description'}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-mono font-bold flex items-center gap-1 ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}₱{formatAmount(t.amount)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10">
                    {t.category}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors bg-neutral-50 dark:bg-white/5 rounded-full"
                    title="Delete Transaction"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Layout: Traditional Table */}
          <div className="hidden md:block overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full pb-2 select-none">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold text-right flex-shrink-0">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 break-words">
                      <p className="font-medium text-neutral-900 dark:text-white">{t.description || 'No description'}</p>
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
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors"
                        title="Delete Transaction"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.02]">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseTable;
