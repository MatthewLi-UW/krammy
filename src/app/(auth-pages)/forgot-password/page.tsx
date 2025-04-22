'use client';

import { useState, useEffect } from "react";
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";

/**
 * Site header with logo and navigation
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
 * Forgot Password Page
 * Handles password reset request functionality
 */
export default function ForgotPassword(props: { searchParams: Promise<Message> }) {
  // State to hold messages (success/error) from form submission
  const [message, setMessage] = useState<Message | null>(null);

  // Load any messages passed via URL parameters (e.g., after form submission)
  useEffect(() => {
    const fetchMessage = async () => {
      const messageData = await props.searchParams;
      setMessage(messageData);
    };

    fetchMessage();
  }, [props.searchParams]);

  // Don't render until we've loaded the messages
  if (!message) return null; 

  return (
    <div 
      className="bg-[var(--color-background)] flex items-center justify-center min-h-screen" 
    >
      <Header />
      <div 
        className="bg-[var(--color-secondary)] w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
      >
        <h1 className="text-2xl font-bold text-center text-[var(--color-text-dark)]">Reset Password</h1>
        <p className="text-sm text-center text-[var(--color-text)]">
          Enter your email to receive a password reset link
        </p>

        {/* Password reset form - connects to forgotPasswordAction */}
        <form action={forgotPasswordAction} className="space-y-4">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address*" 
              required 
              className="bg-[var(--color-background-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2 text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Reset Password
          </button>

          {/* Display any success/error messages */}
          {"message" in message && <FormMessage message={message} />}

          <div className="text-center text-sm text-[var(--color-text-light)]">
            Remember your password? <Link href="/sign-in" className="text-[var(--color-primary)] hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}