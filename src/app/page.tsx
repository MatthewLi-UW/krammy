'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
export default function LandingPage() {
  const [showNav, setShowNav] = useState(false)
  const [email, setEmail] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://yourapp.com";

  useEffect(() => {
    const loadGoogleScript = () => {
      return new Promise((resolve) => {
        if (window.google) {
          resolve(true);
          return;
        }
  
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };
  
    loadGoogleScript().then(() => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", // Ensure fallback
          callback: handleSignIn,
        });
      }
    });
  
  }, []);

  const handleSignIn = async () => {
    const redirectTo = `${baseUrl}/auth/callback?redirect_to=/protected`;
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

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setShowNav(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isMounted|| !router) return null; // Ensure it's set before accessing


  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const signUpRedirectAction = () => {
    if (email) {
      router.push(`/sign-up?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Sticky navigation - appears on scroll */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: showNav ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50"
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/krammy_logo.png" alt="Krammy" width={24} height={24} />
              <span className="font-medium text-gray-900">Krammy</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/upload" className="px-4 py-2 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432]">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Initial viewport section */}
      <div className="min-h-screen flex flex-col">
        {/* Top logo only */}
        <div className="py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center">
              <Image src="/krammy_logo.png" alt="Krammy" width={24} height={24} />
              <span className="font-medium text-gray-900 ml-2">Krammy</span>
            </div>
          </div>
        </div>

        {/* Hero section */}
        <div className="flex-grow flex items-center">
          <div className="max-w-5xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left column - existing content */}
              <div className="max-w-lg">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-6xl font-serif leading-tight mb-6"
                >
                  <TypeAnimation
                    sequence={[
                      'Learn Smarter,',
                      2000,
                      'Type Faster',
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                    className="block"
                  />
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl text-gray-600 mb-12"
                >
                  Transform your study notes into interactive typing exercises. 
                  Master your material while improving your typing speed.
                </motion.p>

                {/* Sign-in section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="space-y-6 max-w-md"
                >
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => google.accounts.id.prompt()} 
                  >
                    <Image src="/google-icon.png" alt="Google" width={20} height={20} />
                    <span>Continue with Google</span>
                  </button>
                  
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your personal or work email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    <button onClick={signUpRedirectAction} id="emailSignUp" className="w-full px-4 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors">
                      Continue with email
                    </button>
                  </div>
                </motion.div>

                {/* Learn more button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-16"
                >
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </motion.div>
              </div>

              {/* Right column - sample cards image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="hidden md:block relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src="/samplecards.png"
                  alt="Sample flashcards"
                  width={1200}
                  height={900}
                  className="w-[160%] h-auto max-w-none object-contain"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="bg-white">
        {/* Features section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Smart Note Processing",
                  description: "Our AI analyzes your notes and creates personalized typing exercises."
                },
                {
                  title: "Type to Memorize",
                  description: "Boost retention through active recall and typing practice."
                },
                {
                  title: "Track Progress",
                  description: "Monitor your improvement with detailed analytics."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="space-y-3"
                >
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center px-6">
            <h2 className="text-3xl font-semibold mb-6">
              Ready to improve your typing and learning?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of students who are already learning faster and typing better.
            </p>
            <Link href="/upload">
            <button className="px-6 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors">
              Get Started Free
            </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-12 flex justify-between items-center">
            <span className="font-medium">Krammy</span>
            <p className="text-sm text-gray-600">© 2024 Krammy. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
};
