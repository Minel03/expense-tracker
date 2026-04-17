import { supabase } from './supabaseClient';

export const getTransactions = async (userId, month = null) => {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (month) {
    const startOfMonth = `${month}-01`;
    const year = parseInt(month.split('-')[0]);
    const monthIdx = parseInt(month.split('-')[1]);
    const lastDay = new Date(year, monthIdx, 0).getDate();
    const endOfMonth = `${month}-${String(lastDay).padStart(2, '0')}`;
    
    query = query.gte('date', startOfMonth).lte('date', endOfMonth);
  }

  const { data, error } = await query;
  return { data, error };
};

export const addTransaction = async (transaction) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();
  return { data, error };
};

export const bulkAddTransactions = async (transactions) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
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

export const getTransactionSummary = async (userId, month = null) => {
  // We always need all transactions to calculate lifetime balance
  const { data: allData, error: allErr } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .eq('user_id', userId);
  
  if (allErr) return { error: allErr };

  const lifetime = allData.reduce(
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

  let monthly = { income: 0, expense: 0 };
  if (month) {
    monthly = allData
      .filter(t => t.date && t.date.startsWith(month))
      .reduce(
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
  } else {
    monthly = { ...lifetime };
  }

  return { 
    data: { 
      income: monthly.income, 
      expense: monthly.expense, 
      balance: lifetime.income - lifetime.expense 
    }, 
    error: null 
  };
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

// --- Subscription Functions ---

export const getSubscriptions = async (userId) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const processSubscriptions = async (userId) => {
  // 1. Fetch active subs
  const { data: subs, error: subError } = await getSubscriptions(userId);
  if (subError || !subs) return;

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentDay = today.getDate();

  const transactionsToInsert = [];
  const subsToUpdate = [];

  for (const sub of subs) {
    if (sub.last_processed_month !== currentMonth && currentDay >= sub.billing_day) {
      // Create a new transaction explicitly marked as recurring
      transactionsToInsert.push({
        user_id: userId,
        type: 'expense',
        amount: sub.amount,
        category: sub.category,
        description: sub.name,
        date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(sub.billing_day).padStart(2, '0')}`,
        is_recurring: true
      });

      subsToUpdate.push({
        id: sub.id,
        last_processed_month: currentMonth
      });
    }
  }

  if (transactionsToInsert.length > 0) {
    // Inject the simulated transaction
    await bulkAddTransactions(transactionsToInsert);

    // Patch the subscriptions so they aren't Double-Processed
    for (const subUpdate of subsToUpdate) {
      await supabase.from('subscriptions').update({ last_processed_month: subUpdate.last_processed_month }).eq('id', subUpdate.id);
    }
  }
};
