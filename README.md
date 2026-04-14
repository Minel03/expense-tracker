# 💰 FIMS — Financial Insight Management System

A modern, AI-powered personal finance tracker built with **Next.js**, **Supabase**, and **Groq AI**. Track your income and expenses, visualize spending patterns, attach receipt photos, and get personalized financial insights — all in a beautiful, fully responsive Light/Dark mode interface.

---

## ✨ Features

### 📊 Dashboard

- **Summary Cards** — Total Balance, Income, and Expenses with Philippine Peso (₱) formatting and comma separators
- **Spending Distribution Chart** — Doughnut chart showing expense breakdown by category (income excluded)
- **Transaction Calendar** — Full monthly calendar with clickable dates showing daily transaction summaries
- **Recent Transactions Table** — Searchable, paginated table with full CRUD support
- **Smart Analysis** — AI-generated insights powered by Groq (llama-3.3-70b-versatile)
- **Quick Tips** — Personalized AI tips based on your real spending data

### 💳 Transactions

- Add income or expenses via a sleek **modal form** (triggered from anywhere in the app)
- **Attach receipt photos** — uploaded securely to Supabase Storage (private bucket)
- **Edit** any transaction inline from the detail modal
- **Delete** with a two-step confirmation guard
- Search and filter transactions by description, category, or amount
- 5 transactions per page with Previous/Next pagination

### 🗓️ Transaction Calendar

- Browse any month with Previous/Next navigation
- Color-coded dots per day: 🟢 income · 🔴 expense
- Click any day to reveal all transactions with amounts and categories
- Today is highlighted automatically

### 🌗 Light / Dark Mode

- Global theme toggle (Sun/Moon) in the navbar
- All components fully support both themes
- Persists across sessions via `next-themes`

### 🔒 Security

- Supabase Row Level Security (RLS) — users can only access their own data
- Receipt images stored in a **private** Supabase Storage bucket with signed URLs (1-hour expiry)
- AI insights processed server-side — API key never exposed to the client

---

## 🛠️ Tech Stack

| Layer        | Technology                           |
| ------------ | ------------------------------------ |
| Framework    | Next.js 15 (App Router)              |
| Styling      | Tailwind CSS v4                      |
| Database     | Supabase (PostgreSQL)                |
| Auth         | Supabase Auth                        |
| File Storage | Supabase Storage                     |
| AI Engine    | Groq Cloud (llama-3.3-70b-versatile) |
| Charts       | Chart.js + react-chartjs-2           |
| Theming      | next-themes                          |
| Icons        | react-icons (Feather)                |

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Set Up the Database

Run the SQL in `src/lib/schema.sql` in your Supabase **SQL Editor**.

### 4. Set Up Receipt Storage

1. Go to Supabase → **Storage** → **New Bucket**
2. Name it `receipts`, set to **Private**
3. Run the storage RLS policies from the schema comments

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/insights/       # Server-side Groq AI route
│   ├── dashboard/          # Main dashboard page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── globals.css         # Global styles + Tailwind config
├── components/
│   ├── expense-form/       # Add Transaction modal
│   ├── expense-table/      # Transaction table with search & pagination
│   ├── navbar/             # Navigation + theme toggle
│   ├── transaction-calendar/ # Monthly transaction calendar
│   └── theme-provider.jsx  # next-themes provider
└── lib/
    ├── ai.js               # AI insights client logic + caching
    ├── auth.js             # Supabase auth helpers
    ├── schema.sql          # Database schema + RLS policies
    ├── supabaseClient.js   # Supabase client instance
    └── transactions.js     # Transaction CRUD + Storage helpers
```

---

## 🔑 Getting API Keys

- **Supabase**: [https://supabase.com](https://supabase.com) — Free tier available
- **Groq**: [https://console.groq.com](https://console.groq.com) — Free tier with generous rate limits

---

## 📄 License

MIT — free to use and modify.
