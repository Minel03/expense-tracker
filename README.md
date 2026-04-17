# 💰 FIMS — Financial Insight Management System

A modern, AI-powered personal finance tracker built with **Next.js**, **Supabase**, and **Groq AI**. Track your income and expenses, visualize spending patterns, set budget goals, manage recurring subscriptions, import bank statements with AI, and get personalized financial insights — all in a beautiful, fully responsive Light/Dark mode interface.

---

## ✨ Features

### 📊 Dashboard

- **Summary Cards** — Total Balance, Income, and Expenses with Philippine Peso (₱) formatting
- **Spending Distribution Chart** — Doughnut chart showing expense breakdown by category
- **Transaction Calendar** — Full monthly calendar with clickable dates showing daily transaction summaries
- **Recent Transactions Table** — Searchable, paginated table with full CRUD support, sorted by latest first
- **Smart Analysis** — AI-generated insights powered by Groq (llama-3.3-70b-versatile)
- **Quick Tips** — Personalized AI tips based on your real spending data

### 💳 Transactions

- Add income or expenses via a sleek **modal form** (triggered from anywhere in the app)
- **Attach receipt photos** — uploaded securely to Supabase Storage (private bucket)
- **Edit** any transaction inline from the detail modal
- **Delete** with a two-step confirmation guard
- Search and filter transactions by description, category, or amount
- 5 transactions per page with Previous/Next pagination

### 🎯 Budget Tracker

- Set monthly spending limits per category (e.g. ₱5,000 for Food)
- Visual progress bars showing how much budget remains
- **Edit** and **Delete** individual budget goals with hover-reveal controls
- Automatically calculates actual spending from existing transactions

### 🔁 Smart Subscription Manager

- Register recurring subscriptions (Netflix, Spotify, Gym, etc.) with a billing day
- **Auto-deduction engine** — on every dashboard load, the system checks if it's time to bill any active subscription and automatically injects the expense into your transaction ledger
- Each subscription card shows the **next billing date** dynamically
- **Smart De-Duplicator** — when importing a CSV, the system cross-references existing auto-generated recurring transactions and drops any duplicates to prevent double-billing

### 🤖 AI CSV Import (Auto-Mapper)

- Upload any raw bank statement CSV — no specific format required
- Powered by **Groq AI** in JSON mode to intelligently:
  - Detect and normalize date formats
  - Parse split Debit/Credit columns into signed amounts
  - Auto-categorize transactions (e.g. `UBER*TRIP` → Transport, `NETFLIX` → Entertainment)
- Processes large files in **chunks of 25 rows** to prevent timeouts
- Animated **"FinAI is Processing"** progress overlay during import
- Imports are cleaned against existing recurring transactions before insertion

### 📤 Date Range Exports

- **Export CSV** or **Export PDF** with a beautiful date range picker modal
- Quick presets: **This Month**, **Last Month**, **This Year**, **All Time**
- Or pick any custom From / To date range
- PDF includes the date period header, color-coded income/expense rows, and violet branded table headers
- Filenames include the selected date range (e.g. `Expense Report 2026-04-01 - 2026-04-30.pdf`)

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
- AI insights and CSV parsing processed **server-side** — API key never exposed to the client

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
| CSV Parsing  | PapaParse                            |
| PDF Export   | jsPDF + jspdf-autotable              |
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

Run the full SQL in `src/lib/schema.sql` in your Supabase **SQL Editor**.

This creates the following tables with RLS policies:

- `profiles` — user profile data
- `transactions` — income/expense records (includes `is_recurring` flag)
- `budgets` — monthly budget goals per category
- `subscriptions` — recurring auto-billed subscriptions
- `insights` — cached AI insight data

### 4. Set Up Receipt Storage

1. Go to Supabase → **Storage** → **New Bucket**
2. Name it `receipts`, set to **Private**
3. The RLS policies for storage are included in the schema comments

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
│   ├── api/
│   │   ├── insights/       # Server-side Groq AI insights route
│   │   └── upload-csv/     # AI Auto-Mapper CSV import route
│   ├── dashboard/          # Main dashboard page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── globals.css         # Global styles + Tailwind config
├── components/
│   ├── budget/
│   │   ├── BudgetTracker.jsx       # Budget goals with CRUD controls
│   │   └── SubscriptionManager.jsx # Smart recurring subscription manager
│   ├── chat/               # FinAI chat widget
│   ├── expense-form/       # Add Transaction modal
│   ├── expense-table/      # Transaction table (search, pagination, import, export)
│   ├── navbar/             # Navigation + theme toggle
│   ├── transaction-calendar/ # Monthly transaction calendar
│   └── theme-provider.jsx  # next-themes provider
└── lib/
    ├── ai.js               # AI insights client logic + caching
    ├── auth.js             # Supabase auth helpers
    ├── schema.sql          # Full database schema + RLS policies
    ├── supabaseClient.js   # Supabase client instance
    └── transactions.js     # Transaction CRUD, budget, subscription, and storage helpers
```

---

## 🔑 Getting API Keys

- **Supabase**: [https://supabase.com](https://supabase.com) — Free tier available
- **Groq**: [https://console.groq.com](https://console.groq.com) — Free tier with generous rate limits

---

## 📄 License

MIT — free to use and modify.
