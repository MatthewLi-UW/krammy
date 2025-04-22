'use client';

import { useState, useEffect } from "react";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";

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

/**
 * Sign-up component for user registration
 */
export default function Signup(props: { searchParams: Promise<Message> }) {
  // Track email input state (allows pre-filling from URL parameters)
  const [email, setEmail] = useState<string | undefined>(undefined);
  // Store messages (error/success) from form submission
  const [message, setMessage] = useState<Message | null>(null);

  /**
   * Load message and email from URL parameters on component mount
   */
  useEffect(() => {
    const fetchMessage = async () => {
      const messageData = await props.searchParams;
      setMessage(messageData);
      
      // If there's an email in the params, pre-fill the form field
      if ("email" in messageData && typeof messageData.email === 'string') {
        setEmail(messageData.email);
      }
    };

    fetchMessage();
  }, [props.searchParams]);

  // Don't render until parameters are loaded
  if (!message) return null; 

  return (
    <div 
      className="bg-[var(--color-background)] flex items-center justify-center min-h-screen font-karla" 
    >
      <Header />
      <div 
        className="bg-[var(--color-secondary)] w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
      >
        <h1 className="text-2xl font-bold text-center text-[var(--color-text-dark)]">Create Account</h1>
        <p className="text-sm text-center text-[var(--color-text)]">
          Sign up to start using Krammy
        </p>

        {/* Sign-up form - connects to server action */}
        <form action={signUpAction} className="space-y-4">
          {/* Email input field */}
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address*"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="bg-[var(--color-background-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          {/* Password input field */}
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password*" 
              required 
              minLength={6}
              className="bg-[var(--color-background-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          {/* Sign-up button */}
          <button 
            type="submit" 
            className="w-full py-2 text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Sign Up
          </button>

          {/* Display form submission messages */}
          {"message" in message && <FormMessage message={message} />}

          {/* Sign-in link */}
          <div className="text-center text-sm text-[var(--color-text-light)]">
            Already have an account? <Link href="/sign-in" className="text-[var(--color-primary)] hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}