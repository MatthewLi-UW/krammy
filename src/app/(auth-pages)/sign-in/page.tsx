'use client';

import { useEffect, useState } from "react";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";
import Image from 'next/image'
import { supabase } from '@/utils/supabase/client';

/**
 * Application header component with logo and navigation
 * CUSTOMIZATION: Modify this component to change header appearance
 */
const Header = () => (
  <div className="fixed top-0 left-0 p-6 flex items-center gap-3">
    <Link legacyBehavior href="/">
      <a className="flex items-center gap-3">
        {/* CUSTOMIZATION: Adjust logo size */}
        <KrammyLogo width={40} height={40} />
        {/* CUSTOMIZATION: Change app name text or styling */}
        <span className="text-2xl font-bold text-gray-800">Krammy</span>
      </a>
    </Link>
  </div>
);

// Base URL for redirect handling
// CUSTOMIZATION: Change this to your production URL when deploying
const baseUrl = "http://localhost:3000";

/**
 * Login/Sign-in Page Component
 * Handles email/password and Google OAuth authentication
 */
export default function Login(props: { searchParams: Promise<Message> }) {
  // State for form messages (errors, success notifications)
  const [message, setMessage] = useState<Message | null>(null);

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
          // CUSTOMIZATION: Replace with your Google Client ID in .env
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
   * Load any messages passed via URL parameters
   * (e.g., error messages after failed sign-in attempts)
   */
  useEffect(() => {
    const fetchMessage = async () => {
      const messageData = await props.searchParams;
      setMessage(messageData);
    };

    fetchMessage();
  }, [props.searchParams]);

  // Don't render until messages are loaded
  if (!message) return null;

  return (
    <div 
      // CUSTOMIZATION: Change page background color
      className="bg-beige-light flex items-center justify-center min-h-screen font-karla" 
    >
      <Header />
      
      <div 
        // CUSTOMIZATION: Modify card appearance (background, shadow, rounding)
        className="bg-beige-medium w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
      >
        {/* CUSTOMIZATION: Change page title and description */}
        <h1 className="text-2xl font-bold text-center">Welcome</h1>
        <p className="text-sm text-center text-gray-dark">
          Log in to your account to continue to Krammy
        </p>

        {/* Error message display - positioned at the top of the form */}
        {message && 'error' in message && (
          <div className="text-center">
            {/* CUSTOMIZATION: Change error message styling */}
            <p className="text-red-600 font-medium text-lg">
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
              // CUSTOMIZATION: Modify input field styling
              className="bg-beige-light w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Password input field */}
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password*" 
              required 
              // CUSTOMIZATION: Modify input field styling
              className="bg-beige-light w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {/* Forgot password link */}
            <div className="text-right mt-2">
              <Link 
                href="/forgot-password" 
                // CUSTOMIZATION: Change link color and hover effect
                className="text-sm text-teal hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Sign-in button */}
          <button 
            type="submit" 
            // CUSTOMIZATION: Change button color and hover effect
            className="w-full py-2 text-white bg-teal rounded-md hover:bg-teal-600 transition-colors"
          >
            Continue
          </button>

          {/* Non-error messages (success, info) */}
          {message && !('error' in message) && <FormMessage message={message} />}

          {/* Sign-up link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account? <Link href="/sign-up" className="text-teal hover:underline">Sign up</Link>
          </div>

          {/* Divider with "OR" text */}
          <div className="flex items-center justify-center">
            <div className="w-full border-t border-gray-300 my-4"></div>
            {/* CUSTOMIZATION: Change divider style and text */}
            <span className="px-4 text-gray-600 bg-beige-medium absolute">OR</span>
          </div>

          {/* Google Sign-In button */}
          <button 
            // CUSTOMIZATION: Change Google button style
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => google.accounts.id.prompt()} 
            type="button"
          >
            {/* CUSTOMIZATION: Replace with your own Google icon if desired */}
            <Image src="/google-icon.png" alt="Google" width={20} height={20} />
            <span>Continue with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}