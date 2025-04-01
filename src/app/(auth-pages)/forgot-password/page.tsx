'use client';

import { useState, useEffect } from "react";
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";

/**
 * Site header with logo and navigation
 * CUSTOMIZATION: Modify this component to change header appearance
 */
const Header = () => (
  <div className="fixed top-0 left-0 p-6 flex items-center gap-3">
    <Link legacyBehavior href="/">
      <a className="flex items-center gap-3">
        <KrammyLogo width={40} height={40} />
        {/* CUSTOMIZATION: Change logo size or brand text */}
        <span className="text-2xl font-bold text-gray-800">Krammy</span>
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
      // CUSTOMIZATION: Change background color here
      className="bg-beige-light flex items-center justify-center min-h-screen font-karla" 
    >
      <Header />
      <div 
        // CUSTOMIZATION: Modify card appearance (background, shadow, rounding)
        className="bg-beige-medium w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
      >
        {/* CUSTOMIZATION: Change page title and description */}
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-sm text-center text-gray-dark">
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
              // CUSTOMIZATION: Modify input field styling
              className="bg-beige-light w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* CUSTOMIZATION: Change button color and hover effect */}
          <button 
            type="submit" 
            className="w-full py-2 text-white bg-teal rounded-md hover:bg-teal-600 transition-colors"
          >
            Reset Password
          </button>

          {/* Display any success/error messages */}
          {"message" in message && <FormMessage message={message} />}

          {/* CUSTOMIZATION: Modify link text and styling */}
          <div className="text-center text-sm text-gray-600">
            Remember your password? <Link href="/sign-in" className="text-teal hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}