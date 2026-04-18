import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { message, history, transactions, subscriptions, summary } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Prepare context about the user's finances
    const systemPrompt = `You are FinAI, an expert, concise, and friendly financial assistant for the Expense Tracker app.
You have access to the user's current monthly summary and recent transactions.

MONTHLY SUMMARY:
Income: ₱${summary?.income || 0}
Expenses: ₱${summary?.expense || 0}
Balance: ₱${summary?.balance || 0}

RECENT TRANSACTIONS (Top 20):
${transactions?.slice(0, 20).map(t => `- ID: ${t.id} | Date: ${t.date} | Desc: ${t.description || 'No desc'} (${t.category}) | Amt: ${t.type === 'income' ? '+' : '-'}₱${t.amount}`).join('\n') || 'No transactions found.'}

CURRENT SUBSCRIPTIONS:
${subscriptions?.map(s => `- ID: ${s.id} | Name: ${s.name} | Amt: ₱${s.amount} | Billing Day: ${s.billing_day} (${s.billing_cycle || 'monthly'})`).join('\n') || 'No active subscriptions.'}

INSTRUCTIONS:
1. Answer the user's questions strictly based on their financial data provided above.
2. If they ask about spending in a specific category, calculate it from the transactions provided.
3. Be concise and conversational.
4. Do not provide generic advice unless asked. Focus on their actual data.
5. If the user asks something unrelated to finance or the app, politely steer them back.
6. Format amounts with the ₱ symbol and include comma separators for thousands (e.g. ₱50,000 instead of ₱50000).
7. YOU HAVE TOOLS: You can 'add_transaction', 'modify_transaction', 'add_subscription', or 'delete_subscription' if the user asks. 
8. REMOVING SUBSCRIPTIONS: If a user asks to remove a subscription, use 'delete_subscription' with its ID. 
9. OPTIONAL PURGE: If and ONLY IF the user explicitly asks to remove a subscription "and its transactions" or "wipe its history", you must also call 'delete_transaction' for every transaction matching that subscription's name you see in the recent list.
10. CRITICAL: If the user asks to add a transaction but does NOT specify the amount (e.g. "I bought a PS5"), DO NOT trigger the tool. Reply back asking them how much it cost. 
11. For subscriptions, if no billing day is specified, assume today (${new Date().getDate()}). Billing cycle defaults to 'monthly'.
12. For current date, use '${new Date().toISOString().split('T')[0]}'. Always format numbers in your spoken response with commas.`;

    const formattedHistory = history.filter(h => h.role !== 'system').map(h => ({
      role: h.role,
      content: h.content
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile', // Use a valid Groq model
      temperature: 0.5,
      max_tokens: 500,
      tools: [
        {
          type: "function",
          function: {
            name: "add_transaction",
            description: "Add a new transaction (income or expense) for the user. Do NOT call this to update an existing transaction.",
            parameters: {
              type: "object",
              properties: {
                 type: { type: "string", enum: ["income", "expense"], description: "Whether money was gained or lost" },
                 amount: { type: "number", description: "The amount of the transaction" },
                 category: { type: "string", description: "Category like Food, Transport, Salary, etc." },
                 description: { type: "string", description: "Very short description of the transaction" },
                 date: { type: "string", description: "YYYY-MM-DD date string" }
              },
              required: ["type", "amount", "category", "date"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "modify_transaction",
            description: "Update an existing transaction. Only use this if the user asks to change or update a recent transaction. You MUST know the ID of the transaction.",
            parameters: {
              type: "object",
              properties: {
                 id: { type: "string", description: "The ID of the transaction to modify" },
                 type: { type: "string", enum: ["income", "expense"] },
                 amount: { type: "number" },
                 category: { type: "string" },
                 description: { type: "string" },
                 date: { type: "string", description: "YYYY-MM-DD" }
              },
              required: ["id"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "delete_transaction",
            description: "Delete an existing transaction. You MUST know the ID of the transaction.",
            parameters: {
              type: "object",
              properties: {
                 id: { type: "string", description: "The ID of the transaction to delete" }
              },
              required: ["id"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "add_subscription",
            description: "Add a new automated/recurring subscription (e.g., Netflix, Spotify, Rent).",
            parameters: {
              type: "object",
              properties: {
                 name: { type: "string", description: "Name of the service (e.g. 'Netflix')" },
                 amount: { type: "number", description: "The recurring cost" },
                 billing_day: { type: "integer", description: "The day of the month it's billed (1-31)" },
                 billing_cycle: { type: "string", enum: ["monthly", "yearly"], description: "Default is 'monthly'" },
                 billing_month: { type: "integer", description: "Required only for 'yearly' cycle (1-12)" },
                 category: { type: "string", description: "Category like Entertainment, Utilities, Rent, Software, etc." }
              },
              required: ["name", "amount", "billing_day", "category"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "delete_subscription",
            description: "Completely remove a smart/automated subscription. Does NOT delete past transactions unless explicitly requested by user (you'd need to call delete_transaction separately for those).",
            parameters: {
              type: "object",
              properties: {
                 id: { type: "string", description: "The ID of the subscription to delete" }
              },
              required: ["id"]
            }
          }
        }
      ]
    });

    const responseMessage = completion.choices[0]?.message;
    
    if (responseMessage?.tool_calls) {
      return NextResponse.json({ 
        tool_calls: responseMessage.tool_calls 
      });
    }

    const reply = responseMessage?.content || "I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
