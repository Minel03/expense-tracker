import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { rows, userId } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    const systemPrompt = `You are a highly intelligent financial data parser. 
The user is providing an array of raw row data extracted from a bank CSV file.
Your job is to examine these rows, ignore header rows if they exist, and extract all valid financial transactions.

You MUST reply with a PERFECT JSON object matching this exact schema:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Short clean description (e.g., 'Starbucks', 'Chevron', 'Payroll')",
      "amount": 25.50, // ALWAYS POSITIVE NUMBER
      "type": "expense" or "income", // guess based on context or sign. Negative in bank usually means expense. Positive usually means income. If missing sign, guess from description.
      "category": "Food" | "Transport" | "Entertainment" | "Shopping" | "Health" | "Travel" | "Utilities" | "Rent" | "Salary" | "Freelance" | "Investment" | "Other"
    }
  ]
}

- For column mapping: You need to logically figure out which column is the date, description, and amount by looking at the data.
- If a row is clearly just a header or empty, IGNORE IT. Do not include it in the output array.
- Make your best guess for the 'category' based on the description string.
- The 'amount' should always be a positive float. Store the polarity in 'type'.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(rows) }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1, // low temp for pure parsing
      response_format: { type: 'json_object' }
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) throw new Error("AI returned empty response");
    
    // Parse the JSON safely
    let parsedData = { transactions: [] };
    try {
      parsedData = JSON.parse(reply);
    } catch (err) {
      console.error("AI JSON parsing failed", reply);
      throw new Error("AI returned malformed JSON");
    }

    // Attach user_id
    const finalTransactions = (parsedData.transactions || []).map(t => ({
      ...t,
      user_id: userId
    }));

    return NextResponse.json({ transactions: finalTransactions });
  } catch (error) {
    console.error('CSV API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
