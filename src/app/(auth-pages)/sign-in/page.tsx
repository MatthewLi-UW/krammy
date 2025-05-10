'use client';

import { useEffect, useState } from "react";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";
import Image from 'next/image'
import { supabase } from '@/utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Application header component with logo and navigation
 */
const Header = () => (
  <div className="fixed top-0 left-0 p-6 flex items-center gap-3">
    <Link legacyBehavior href="/">
      <a className="flex items-center gap-3">
        <KrammyLogo width={40} height={40} />
        <span className="text-2xl font-bold text-[var(--color-text-dark)]">Krammy</span>
      </a>
    </Link>
  </div>
);

// Base URL for redirect handling
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction? "https://krammy.vercel.app": "http://localhost:3000";

/**
 * Login/Sign-in Page Component
 * Handles email/password and Google OAuth authentication
 */
export default function Login() {
  // State for form messages (errors, success notifications)
  const [message, setMessage] = useState<Message | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  /**
   * Google Sign-In initialization
   * Loads Google Identity Services script and sets up auth
   */
  useEffect(() => {
    // Helper function to load the Google Identity Services script
    const loadGoogleScript = () => {
      return new Promise((resolve) => {
        // Skip if already loaded
        if (window.google) {
          resolve(true);
          return;
        }
  
        // Create and inject script element
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };
  
    // Initialize Google Sign-In after script loads
    loadGoogleScript().then(() => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", 
          callback: handleSignIn,
        });
      }
    });
  }, []);

  /**
   * Google Sign-In handler
   * Initiates OAuth flow with Supabase
   */
  const handleSignIn = async () => {
    // Set redirect URL after successful sign-in
    const redirectTo = `${baseUrl}/auth/callback?redirect_to=/protected`;
    
    // Start Supabase OAuth flow with Google provider
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  /**
   * Load messages from URL parameters directly
   */
  useEffect(() => {
    // Simple direct checking of URL parameters
    if (searchParams && searchParams.get('error')) {
      setMessage({ 
        error: decodeURIComponent(searchParams.get('error') || '') 
      });
    } else if (searchParams && searchParams.get('success')) {
      setMessage({ 
        success: decodeURIComponent(searchParams.get('success') || '') 
      });
    } else {
      // No message in URL, set empty message object
      setMessage({} as Message);
    }
  }, [searchParams]);

  return (
    <div 
      className="bg-[var(--color-background)] flex items-center justify-center min-h-screen font-karla" 
    >
      <Header />
      
      <div 
        className="bg-[var(--color-secondary)] w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
      >
        <h1 className="text-2xl font-bold text-center text-[var(--color-text-dark)]">Welcome</h1>
        <p className="text-sm text-center text-[var(--color-text)]">
          Log in to your account to continue to Krammy
        </p>

        {/* Error message display - positioned at the top of the form */}
        {message && 'error' in message && message.error && (
          <div className="text-center">
            <p className="text-[var(--color-error-text)] font-medium text-lg">
              {message.error}
            </p>
          </div>
        )}

        {/* Sign-in form - connects to server action */}
        <form action={signInAction} className="space-y-4">
          {/* Email input field */}
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address*" 
              required 
              className="bg-[var(--color-secondary-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          {/* Password input field */}
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password*" 
              required 
              className="bg-[var(--color-secondary-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
            {/* Forgot password link */}
            <div className="text-right mt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Sign-in button */}
          <button 
            type="submit" 
            className="w-full py-2 text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Continue
          </button>

          {/* Non-error messages (success, info) */}
          {message && !('error' in message) && <FormMessage message={message} />}

          {/* Sign-up link */}
          <div className="text-center text-sm text-[var(--color-text-light)]">
            Don&apos;t have an account? <Link href="/sign-up" className="text-[var(--color-primary)] hover:underline">Sign up</Link>
          </div>

          {/* Divider with "OR" text */}
          <div className="flex items-center justify-center">
            <div className="w-full border-t border-[var(--color-card-medium)] my-4"></div>
            <span className="px-4 text-[var(--color-text-light)] bg-[var(--color-secondary)] absolute">OR</span>
          </div>

          {/* Google Sign-In button */}
          <button 
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-[var(--color-card-medium)] rounded-lg hover:bg-[var(--color-background-light)] transition-colors"
            onClick={() => google.accounts.id.prompt()} 
            type="button"
          >
            <Image src="/google-icon.png" alt="Google" width={20} height={20} />
            <span className="text-[var(--color-text)]">Continue with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}