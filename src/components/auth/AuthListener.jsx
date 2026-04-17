"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const AuthListener = () => {
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      
      if (event === 'PASSWORD_RECOVERY') {
        // If we detect a password recovery event, force redirect to the update-password page
        // This ensures the link in the email takes precedence over other redirects
        router.push('/update-password');
      }
      
      if (event === 'SIGNED_IN') {
        // Optional: Redirect to dashboard if on landing page or login page and signed in
        // But we handle this locally in those pages as well
      }

      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null; // This component doesn't render anything
};

export default AuthListener;
