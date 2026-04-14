import { supabase } from './supabaseClient';

/**
 * Generate financial insights using the server-side API and cache them in Supabase.
 * @param {Array} transactions - List of user transactions.
 * @param {Object} summary - Summary of income, expense, and balance.
 * @param {string} userId - ID of the current user.
 */
export const generateFinancialInsights = async (transactions, summary, userId) => {
  const fallback = { 
    insights: getDefaultInsights(), 
    prediction: "We're currently using a default forecast while your AI syncs.",
    tips: getDefaultTips(),
  };

  try {
    // 1. Smart Local Caching based on financial state
    // We create a "fingerprint" of your money. If your money changes, the AI generates new insights!
    const stateFingerprint = `${transactions.length}-${summary.balance}`;
    const cacheKey = `fims_ai_v2_${userId}_${stateFingerprint}`;

    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // 2. Call the server-side Groq API route
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, summary }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.warn("AI API Error:", data.error);
      return { 
        insights: data.insights || fallback.insights, 
        prediction: data.prediction || fallback.prediction 
      };
    }

    // 3. Save to local session (clears when browser closes, keeping things fresh)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error("FIMS AI Strategy Error:", error.message);
    return fallback;
  }
};

export const getDefaultInsights = () => [
  "Welcome back! We're currently using fallback insights while your AI quota resets.",
  "Tip: Setting a monthly budget for 'Food' can help you save up to 10% more.",
  "Positive trend! You've successfully added your recent transactions.",
  "Consider setting aside 20% of your net balance for future investments."
];

export const getDefaultTips = () => [
  'Track your daily expenses to spot patterns over time.',
  'Try to save at least 20% of your monthly income.',
  'Review your subscriptions monthly to avoid unnecessary spending.',
];
