"use client";
import React, { useState } from 'react';
import { updatePassword } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiLock, FiShield } from 'react-icons/fi';

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#8b5cf6_0%,_transparent_25%),radial-gradient(circle_at_bottom_left,_#06b6d4_0%,_transparent_25%)] bg-neutral-950">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-500/20 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-white">New Password</h1>
          <p className="text-neutral-400">Set a strong password for your account</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none text-white"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none text-white"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-violet-500/20"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
