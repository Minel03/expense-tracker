import React, { useState } from 'react';
import { FiClock, FiPlus, FiTrash2, FiSave, FiX, FiCalendar } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';
import { processSubscriptions } from '@/lib/transactions';
import { toast } from 'react-hot-toast';

const categories = [
  'Entertainment',
  'Utilities',
  'Rent',
  'Health',
  'Software',
  'Transport',
  'Other',
];

const SubscriptionManager = ({ subscriptions, onUpdate, userId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState('');
  const [category, setCategory] = useState('Entertainment');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !amount || !billingDay) {
      return toast.error('Please fill all fields.');
    }

    let day = parseInt(billingDay);
    if (day < 1 || day > 31) {
      return toast.error('Billing day must be between 1 and 31.');
    }

    setSaving(true);
    const { error } = await supabase.from('subscriptions').insert([
      {
        user_id: userId,
        name,
        amount: parseFloat(amount),
        billing_day: day,
        category,
        last_processed_month: '', // starts empty so engine triggers immediately if past the date
      },
    ]);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      // Immediately run the engine so if billing day has already passed this
      // month, the transaction fires right now instead of on the next page load.
      await processSubscriptions(userId);

      const today = new Date().getDate();
      const day = parseInt(billingDay);
      if (today >= day) {
        toast.success(`✅ "${name}" activated & deducted for this month!`);
      } else {
        toast.success(`✅ "${name}" activated! First bill on the ${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}.`);
      }

      setIsAdding(false);
      setName('');
      setAmount('');
      setBillingDay('');
      if (onUpdate) onUpdate();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this automated subscription?')) return;
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Subscription removed.');
    if (onUpdate) onUpdate();
  };

  return (
    <div className='bg-white dark:bg-white/5 shadow-xl dark:shadow-2xl dark:backdrop-blur-xl border border-neutral-100 dark:border-white/10 p-8 rounded-3xl relative overflow-hidden transition-all'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-xl font-bold flex items-center gap-2'>
          <FiClock className='text-blue-500' />
          Smart Subs
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className='p-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition'>
          {isAdding ? <FiX /> : <FiPlus />}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSave}
          className='mb-6 bg-neutral-50 dark:bg-black/20 p-4 rounded-2xl border border-neutral-200 dark:border-white/5 space-y-3 animate-in fade-in zoom-in-95'>
          <div>
            <label className='text-xs text-neutral-500 uppercase tracking-wider font-semibold'>
              Service Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Netflix'
              className='w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500'
              required
            />
          </div>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-xs text-neutral-500 uppercase tracking-wider font-semibold'>
                Cost (₱)
              </label>
              <input
                type='number'
                step='0.01'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='500'
                className='w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500'
                required
              />
            </div>
            <div className='w-24'>
              <label className='text-xs text-neutral-500 uppercase tracking-wider font-semibold'>
                Day (1-31)
              </label>
              <input
                type='number'
                min='1'
                max='31'
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                placeholder='15'
                className='w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500'
                required
              />
            </div>
          </div>

          <div>
            <label className='text-xs text-neutral-500 uppercase tracking-wider font-semibold'>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 cursor-pointer'>
              {categories.map((c) => (
                <option
                  key={c}
                  value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type='submit'
            disabled={saving}
            className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition mt-2 flex justify-center items-center gap-2'>
            <FiSave /> Save Auto-Pilot
          </button>
        </form>
      )}

      {subscriptions && subscriptions.length > 0 ? (
        <div className='space-y-3'>
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className='p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-white/5 rounded-2xl flex items-center justify-between group'>
              <div>
                <p className='font-semibold text-sm'>{sub.name}</p>
                <p className='text-xs text-neutral-500 flex items-center gap-1 mt-0.5'>
                  <FiCalendar className='w-3 h-3' />
                  {(() => {
                    const today = new Date();
                    const billedThisMonth = sub.last_processed_month === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                    if (billedThisMonth) {
                      // Calculate next month's billing date
                      const nextDate = new Date(today.getFullYear(), today.getMonth() + 1, sub.billing_day);
                      return `Next bill: ${nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                    } else if (today.getDate() >= sub.billing_day) {
                      return `Due this month (missed — will retry on reload)`;
                    } else {
                      const thisMonth = new Date(today.getFullYear(), today.getMonth(), sub.billing_day);
                      return `Next bill: ${thisMonth.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                    }
                  })()}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <span className='font-mono font-bold text-rose-500 dark:text-rose-400 text-sm'>
                  -₱
                  {parseFloat(sub.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className='text-neutral-400 hover:text-rose-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition p-1'>
                  <FiTrash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center p-4'>
          <p className='text-sm text-neutral-500 italic'>
            No automated subscriptions yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
