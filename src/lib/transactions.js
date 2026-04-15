import { supabase } from './supabaseClient';

export const getTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
};

export const addTransaction = async (transaction) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();
  return { data, error };
};

export const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  return { error };
};

export const uploadReceipt = async (userId, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file, { upsert: false });

  if (error) return { path: null, error };
  return { path: data.path, error: null };
};

export const getReceiptUrl = async (path) => {
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, 60 * 60); // 1 hour expiry

  if (error) return { url: null, error };
  return { url: data.signedUrl, error: null };
};

export const deleteReceipt = async (path) => {
  const { error } = await supabase.storage
    .from('receipts')
    .remove([path]);
  return { error };
};

export const getTransactionSummary = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId);
  
  if (error) return { error };

  const summary = data.reduce(
    (acc, curr) => {
      if (curr.type === 'income') {
        acc.income += parseFloat(curr.amount);
      } else {
        acc.expense += parseFloat(curr.amount);
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  summary.balance = summary.income - summary.expense;
  return { data: summary, error: null };
};

// --- Budget Functions ---

export const getBudgets = async (userId, month) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month);
  return { data, error };
};

export const upsertBudget = async (budget) => {
  const { data, error } = await supabase
    .from('budgets')
    .upsert([budget], { onConflict: 'user_id, category, month' })
    .select();
  return { data, error };
};

export const deleteBudget = async (id) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  return { error };
};
