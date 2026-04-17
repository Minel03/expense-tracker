import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";
import AuthListener from "@/components/auth/AuthListener";

export const metadata = {
  title: "FIMS - Financial Insight System",
  description: "Manage your expenses and get smart financial summaries",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--toast-bg, #171717)',
                color: 'var(--toast-text, #fff)',
                border: '1px solid rgba(150,150,150,0.1)',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
          <AuthListener />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
