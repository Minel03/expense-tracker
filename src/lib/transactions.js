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
