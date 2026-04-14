"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { FiArrowRight, FiCheckCircle, FiCpu, FiShield } from 'react-icons/fi';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse"></div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-violet-400 text-sm font-bold mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <FiCpu className="animate-spin-slow" />
          AI-Powered Financial Freedom
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Master Your Money <br className="hidden md:block" /> with Intelligence.
        </h1>
        
        <p className="max-w-2xl text-xl text-neutral-400 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Experience the NEXT generation of expense tracking. Get AI insights, 
          automated predictions, and a premium dashboard that puts your future first.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <Link href="/register" className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-violet-500/20 active:scale-95">
            Get Started for Free
            <FiArrowRight />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95">
            Login
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="glass p-8 rounded-3xl text-left group">
            <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center text-violet-500 mb-6 group-hover:scale-110 transition-transform">
              <FiCpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Insights</h3>
            <p className="text-neutral-500">Personalized suggestions to optimize your spending and boost your savings.</p>
          </div>
          <div className="glass p-8 rounded-3xl text-left group">
            <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center text-cyan-500 mb-6 group-hover:scale-110 transition-transform">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Tracking</h3>
            <p className="text-neutral-500">Unified dashboard to view all your income and expenses in one stunning view.</p>
          </div>
          <div className="glass p-8 rounded-3xl text-left group">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
            <p className="text-neutral-500">Enterprise-grade security using Supabase and Row-Level Security policies.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm">
        <p>© 2026 FIMS - AI Financial Insight System. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
