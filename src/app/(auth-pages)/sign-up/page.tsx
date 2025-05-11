'use client';

import { useState, useEffect, FormEvent, Suspense } from "react";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import Link from "next/link";
import KrammyLogo from "@/app/components/logo";
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';

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
 * Helper function to safely decode URI components
 */
function safeDecodeURIComponent(value: string | null): string {
  if (!value) return '';
  
  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.error('Error decoding URI component:', error);
    // Return the encoded version rather than crashing
    return value;
  }
}

/**
 * Sign-up form component that uses searchParams
 */
const SignupForm = () => {
  // Track form input states
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false
  });
  
  // Store messages (error/success) from form submission
  const [message, setMessage] = useState<Message>({} as Message);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const searchParams = useSearchParams();

  /**
   * Load message and email from URL parameters directly with safe decoding
   */
  useEffect(() => {
    try {
      // Get error message from URL if present
      if (searchParams && searchParams.get('error')) {
        setMessage({ 
          error: safeDecodeURIComponent(searchParams.get('error'))
        });
      } 
      // Get success message from URL if present
      else if (searchParams && searchParams.get('success')) {
        const successMsg = safeDecodeURIComponent(searchParams.get('success'));
        setMessage({ success: successMsg });
        
        // Check if it's a signup success message
        if (successMsg.includes("Thanks for signing up")) {
          setShowSuccessMessage(true);
        }
      }
      
      // Get email from URL if present (for form prefill)
      if (searchParams && searchParams.get('email')) {
        setEmail(safeDecodeURIComponent(searchParams.get('email')));
      }
    } catch (err) {
      // Failsafe error handling
      console.error("Error processing URL parameters:", err);
      setMessage({ error: "An error occurred while processing your request" });
    }
  }, [searchParams]);

  // Validate password as user types
  useEffect(() => {
    setPasswordRequirements({
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};\\':"\\|,.<>\/?`~]/.test(password),
      length: password.length >= 6
    });
  }, [password]);

  // Form validation handler
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Reset error state
    setPasswordError("");
    
    // Check if passwords match
    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordError("Passwords do not match");
      return false;
    }

    // Check if password meets all requirements
    const { lowercase, uppercase, number, special } = passwordRequirements;
    if (!(lowercase && uppercase && number && special)) {
      e.preventDefault();
      setPasswordError("Password doesn't meet all requirements");
      return false;
    }
  };

  return (
    <div 
      className="bg-[var(--color-secondary)] w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md"
    >
      <h1 className="text-2xl font-bold text-center text-[var(--color-text-dark)]">Create Account</h1>
      <p className="text-sm text-center text-[var(--color-text)]">
        Sign up to start using Krammy
      </p>
      
      {/* Success notification */}
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-300 rounded-md p-4 text-green-800">
          <p className="font-medium">Thanks for signing up!</p>
          <p className="text-sm mt-1">Please check your email for a verification link.</p>
        </div>
      )}

      {/* Error message display */}
      {message && 'error' in message && message.error && (
        <div className="text-center">
          <p className="text-[var(--color-error-text)] font-medium text-lg">
            {message.error}
          </p>
        </div>
      )}

      {/* Sign-up form - connects to server action */}
      <form action={signUpAction} onSubmit={handleSubmit} className="space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required 
            minLength={6}
            className="bg-[var(--color-background-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
          
          {/* Password requirements checklist */}
          {(passwordFocused || password.length > 0) && (
            <div className="mt-2 p-3 bg-[var(--color-background-light)] rounded-md border border-[var(--color-card-medium)]">
              <p className="text-sm font-medium mb-2 text-[var(--color-text)]">Password requirements:</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  {passwordRequirements.lowercase ? 
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-[var(--color-error-text)]" />}
                  <span>Lowercase letter (a-z)</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.uppercase ? 
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-[var(--color-error-text)]" />}
                  <span>Uppercase letter (A-Z)</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.number ? 
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-[var(--color-error-text)]" />}
                  <span>Number (0-9)</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.special ? 
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-[var(--color-error-text)]" />}
                  <span>Special character (!@#$...)</span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordRequirements.length ? 
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-[var(--color-error-text)]" />}
                  <span>Minimum 6 characters</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Confirm Password input field */}
        <div>
          <input 
            type="password"
            name="confirmPassword" 
            placeholder="Confirm Password*" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            minLength={6}
            className="bg-[var(--color-background-light)] w-full px-3 py-2 border border-[var(--color-card-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        {/* Sign-up button */}
        <button 
          type="submit" 
          className="w-full py-2 text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Sign Up
        </button>

        {/* Display non-error form submission messages */}
        {message && 'success' in message && message.success && !showSuccessMessage && (
          <FormMessage message={message} />
        )}

        {/* Sign-in link */}
        <div className="text-center text-sm text-[var(--color-text-light)]">
          Already have an account? <Link href="/sign-in" className="text-[var(--color-primary)] hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

/**
 * Main Sign-up component 
 * Provides a wrapper with Suspense boundary
 */
export default function Signup() {
  return (
    <div 
      className="bg-[var(--color-background)] flex items-center justify-center min-h-screen font-karla" 
    >
      <Header />
      
      {/* Wrap the form in a Suspense boundary */}
      <Suspense fallback={
        <div className="bg-[var(--color-secondary)] w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md">
          <p className="text-center">Loading...</p>
        </div>
      }>
        <SignupForm />
      </Suspense>
    </div>
  );
}