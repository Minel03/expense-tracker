"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { updatePassword, getCurrentUser, updateProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiLock, FiUser, FiShield, FiCheckCircle } from 'react-icons/fi';

const Settings = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile'); // 'security' or 'profile'
  
  // Profile State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/');
        return;
      }
      setUser(currentUser);
      setFullName(currentUser.user_metadata?.full_name || '');
      setEmail(currentUser.email || '');
    };
    fetchUser();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updates = {
      data: { full_name: fullName },
    };

    // If email has changed, we add it to updates
    if (email !== user?.email) {
      updates.email = email;
      toast.loading('Sending confirmation emails...', { id: 'email-change' });
    }

    const { data, error } = await updateProfile(updates);

    if (error) {
      toast.error(error.message, { id: 'email-change' });
    } else {
      if (updates.email) {
        toast.success('Confirmation links sent to both old and new emails!', { id: 'email-change', duration: 6000 });
      } else {
        toast.success('Profile updated successfully!');
      }
      
      // Refresh user data to update the UI
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2">Account Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage your profile and security preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}>
              <FiUser className="w-5 h-5" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}>
              <FiShield className="w-5 h-5" /> Security
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-2 space-y-8">
            {/* User Info Card */}
            <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {user?.user_metadata?.full_name?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || 'User'}</h2>
                  <p className="text-neutral-500 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                <FiCheckCircle /> Verified Account
              </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiUser className="text-violet-600" /> 
                  Personal Information
                </h3>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-500">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                        placeholder="Your Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-500">Email Address</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <p className="mt-2 text-xs text-neutral-500 italic">
                        Note: Changing your email requires confirmation from both old and new addresses.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab (Change Password) */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiLock className="text-violet-600" /> 
                  Change Password
                </h3>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-500">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-500">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                        placeholder="Repeat your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
