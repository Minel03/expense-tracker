"use client";
import React, { useState } from 'react';
import { resetPassword } from '@/lib/auth';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before trying again.`);
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      if (error.message.includes('rate limit')) {
        toast.error('Too many requests. Please wait a minute before trying again.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Password reset link sent to your email!');
      setSubmitted(true);
      startCooldown();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#8b5cf6_0%,_transparent_25%),radial-gradient(circle_at_bottom_left,_#06b6d4_0%,_transparent_25%)] bg-neutral-950">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-6 group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-white">Reset Password</h1>
          <p className="text-neutral-400">
            {submitted 
              ? "We've sent a link to your email to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none text-white"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-violet-500/20"
            >
              {loading ? 'Sending Link...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMail className="w-8 h-8" />
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors disabled:opacity-50"
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Please wait ${cooldown}s to try again` : "Didn't get the email? Try again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
