'use client';

import { useEffect, useState } from "react";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import { SubmitButton } from "@/app/components/submit-button";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";

const Header = () => (
  <div className="fixed top-0 left-0 p-6 flex items-center gap-3">
    <Link legacyBehavior href="/">
      <a className="flex items-center gap-3">
        <KrammyLogo width={40} height={40} />
        <span className="text-2xl font-bold text-gray-800">Krammy</span>
      </a>
    </Link>
  </div>
);

export default function Login(props: { searchParams: Promise<Message> }) {
  const [message, setMessage] = useState<Message | null>(null);

  // Fetch the message asynchronously on component mount
  useEffect(() => {
    const fetchMessage = async () => {
      const messageData = await props.searchParams;
      setMessage(messageData);
    };

    fetchMessage();
  }, [props.searchParams]);

  if (!message) return null; // Prevent rendering until searchParams are loaded

  return (
    <div 
      className="bg-beige-light flex items-center justify-center min-h-screen font-karla" 
    >
      <Header />
      <div 
        className="bg-beige-medium w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">Welcome</h1>
        <p className="text-sm text-center text-gray-dark">
          Log in to your account to continue to Krammy
        </p>

        <form action={signInAction} className="space-y-4">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address*" 
              required 
              className="bg-beige-light w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password*" 
              required 
              className="bg-beige-light w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="text-right mt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-teal hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2 text-white bg-teal rounded-md hover:bg-teal-600 transition-colors"
          >
            Continue
          </button>

          {message && <FormMessage message={message} />}

          <div className="text-center text-sm text-gray-600">
            Don't have an account? <Link href="/sign-up" className="text-teal hover:underline">Sign up</Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full border-t border-gray-300 my-4"></div>
            <span className="px-4 text-gray-600 bg-beige-medium absolute">OR</span>
          </div>

          <button 
            type="button"
            onClick={() => google.accounts.id.prompt()} 
            className="w-full py-2 border border-gray-300 rounded-md flex items-center justify-center space-x-2 bg-beige-light hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.17-4.54H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.83 14.1c-.25-.69-.38-1.43-.38-2.1s.14-1.41.38-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.65-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.65 2.83c.87-2.6 3.3-4.54 6.17-4.54z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}