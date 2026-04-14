"use client";
import React, { useState } from 'react';
import { addTransaction, uploadReceipt } from '@/lib/transactions';
import { toast } from 'react-hot-toast';
import { FiX, FiUploadCloud, FiImage } from 'react-icons/fi';

const categories = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Utilities', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Travel', 'Other'
];

const MAX_FILE_SIZE_MB = 5;

const ExpenseForm = ({ userId, onSuccess, onClose }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[3]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    let receipt_url = null;

    // Upload receipt first if one is attached
    if (receiptFile) {
      const { path, error: uploadError } = await uploadReceipt(userId, receiptFile);
      if (uploadError) {
        toast.error('Failed to upload receipt: ' + uploadError.message);
        setLoading(false);
        return;
      }
      receipt_url = path;
    }

    const { error } = await addTransaction({
      user_id: userId,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      receipt_url,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      setAmount('');
      setDescription('');
      handleRemoveReceipt();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-white/10 rounded-3xl p-6 md:p-8 animate-in zoom-in-95 duration-300 relative overflow-y-auto max-h-[90vh] pb-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors z-10"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-violet-600 dark:bg-violet-500 rounded-full"></span>
          Add Transaction
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex bg-neutral-100 dark:bg-white/5 rounded-xl p-1 transition-colors">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              Income
            </button>
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">₱</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-neutral-900 dark:text-white font-mono"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option
                    key={cat}
                    value={cat}
                    className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-neutral-900 dark:text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">Description (Optional)</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-neutral-900 dark:text-white h-24 resize-none"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">
              Receipt Photo (Optional)
            </label>

            {receiptPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 group">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full max-h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <FiImage className="w-3 h-3" />
                  {receiptFile.name}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group">
                <FiUploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-violet-500 transition-colors mb-2" />
                <span className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-violet-500 transition-colors">
                  Click to upload receipt
                </span>
                <span className="text-xs text-neutral-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg ${type === 'expense' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 dark:shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 dark:shadow-emerald-500/20'} disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]`}
          >
            {loading ? (receiptFile ? 'Uploading receipt...' : 'Processing...') : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
