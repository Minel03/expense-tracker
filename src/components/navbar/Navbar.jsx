'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/auth';
import {
  FiLayout,
  FiPlusCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiSettings,
} from 'react-icons/fi';
import { useTheme } from 'next-themes';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (!user) return null;

  const NavLink = ({ href, icon: Icon, children }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          isActive
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
        }`}>
        <Icon className='w-5 h-5' />
        <span className='font-medium'>{children}</span>
      </Link>
    );
  };

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl'>
          {/* Logo */}
          <Link
            href='/dashboard'
            className='flex items-center gap-2 group'>
            <img
              src='/icon.png'
              alt='FIMS Logo'
              className='w-10 h-10 rounded-xl transform group-hover:rotate-12 transition-transform object-cover shadow-lg shadow-violet-500/20'
            />
            <span className='text-xl font-bold bg-linear-to-r from-violet-600 to-neutral-800 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent hidden sm:block'>
              FIMS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-4'>
            <NavLink
              href='/dashboard'
              icon={FiLayout}>
              Dashboard
            </NavLink>
            <NavLink
              href='/dashboard?add=true'
              icon={FiPlusCircle}>
              Add Transaction
            </NavLink>
            <NavLink
              href='/settings'
              icon={FiSettings}>
              Settings
            </NavLink>
          </div>

          {/* User Actions */}
          <div className='flex items-center gap-2 sm:gap-4 border-l border-neutral-200 dark:border-white/10 pl-4 sm:pl-6 ml-2'>
            <div className='hidden sm:flex flex-col items-end'>
              <span className='text-sm font-semibold text-neutral-900 dark:text-white'>
                {user.user_metadata?.full_name || 'User'}
              </span>
              <span className='text-xs text-neutral-500'>{user.email}</span>
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className='p-2 text-neutral-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all'
                title='Toggle Theme'>
                {theme === 'dark' ? (
                  <FiSun className='w-5 h-5' />
                ) : (
                  <FiMoon className='w-5 h-5' />
                )}
              </button>
            )}

            <button
              onClick={handleLogout}
              className='p-2 text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all'
              title='Logout'>
              <FiLogOut className='w-5 h-5 sm:w-6 sm:h-6' />
            </button>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'>
              {isMenuOpen ? (
                <FiX className='w-6 h-6' />
              ) : (
                <FiMenu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className='md:hidden mt-2 p-4 bg-white/90 dark:bg-black/60 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
            <div className='flex flex-col gap-2'>
              <NavLink
                href='/dashboard'
                icon={FiLayout}>
                Dashboard
              </NavLink>
              <NavLink
                href='/dashboard?add=true'
                icon={FiPlusCircle}>
                Add Transaction
              </NavLink>
              <NavLink
                href='/settings'
                icon={FiSettings}>
                Settings
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
