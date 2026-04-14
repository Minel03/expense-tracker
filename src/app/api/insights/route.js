import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req) {
  try {
    const { transactions, summary } = await req.json();
    const API_KEY = process.env.GROQ_API_KEY;

    console.log('AI API Call: Request received.');

    // Check if the key exists and isn't the placeholder
    if (!API_KEY || API_KEY === 'your_groq_api_key_here') {
      console.error('AI API Error: GROQ_API_KEY is missing or invalid in .env');
      return NextResponse.json(
        { error: 'Missing Groq API Key in Environment' },
        { status: 500 },
      );
    }

    const groq = new Groq({ apiKey: API_KEY });

    const prompt = `
      You are an expert financial advisor for a system called FIMS.
      Analyze the following financial data and provide:
      1. 3-4 concise, actionable insights.
      2. A short prediction for next month's balance (1 sentence).
      
      TRANSACTION SUMMARY:
      - Total Income: $${summary.income}
      - Total Expenses: $${summary.expense}
      - Net Balance: $${summary.balance}
      
      RECENT TRANSACTIONS:
      ${transactions
        .slice(0, 10)
        .map(
          (t) =>
            `- ${t.date}: ${t.type} of $${t.amount} for ${t.category} (${t.description})`,
        )
        .join('\n')}
      
      IMPORTANT: You must return the result as a valid JSON object matching this exact structure:
      {
        "insights": ["Insight 1", "Insight 2", "Insight 3"],
        "prediction": "Your prediction sentence here."
      }
    `;

    console.log('Calling Groq llama-3.3-70b-versatile...');
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You calculate financial insights and return ONLY perfect, raw JSON. Do not use markdown blocks. Output the raw JSON directly.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    console.log('Success with Groq!');
    
    // Groq's JSON mode is highly reliable, but we still safely parse
    const rawContent = response.choices[0]?.message?.content;
    const data = JSON.parse(rawContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Groq API Error:', error.message);

    return NextResponse.json(
      {
        insights: [],
        prediction: 'AI is temporarily unavailable. Check your Groq API key.',
        error: error.message,
        isQuotaError: error.status === 429,
      },
      { status: 429 },
    );
  }
}
