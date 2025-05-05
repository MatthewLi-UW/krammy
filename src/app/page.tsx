'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { useRouter } from 'next/navigation'
import KrammyLogo from "@/app/components/logo"
import FeatureBanner from './landing-components/feature-banner'
import FeatureShowcase from './landing-components/feature-showcase'
// Import supabase client
import { supabase } from '@/utils/supabase/client'

/**
 * LandingPage Component
 * 
 * Main landing page for Krammy application that showcases the product
 * with a hero section, feature banner, CTA section, and footer.
 * 
 * === CUSTOMIZATION GUIDE ===
 * Look for "CUSTOMIZABLE" comments throughout the code to find elements
 * that can be easily modified without coding knowledge.
 */
export default function LandingPage() {
  // *** STATE & REFS ***
  const router = useRouter()
  const featuresRef = useRef<HTMLDivElement>(null)
  
  // Navigation visibility state
  const [showNav, setShowNav] = useState(false)
  
  // Carousel state
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // *** EFFECTS & LIFECYCLE ***
  
  // Handle navigation visibility on scroll
  useEffect(() => {
    // CUSTOMIZABLE: Change 100 to adjust when the navigation bar appears on scroll
    const handleScroll = () => setShowNav(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // *** EVENT HANDLERS ***
  
  // Updated navigation handlers with auth check
  const handleGetStartedClick = async () => {
    const { data } = await supabase.auth.getSession();
    // If logged in, go to protected page, otherwise go to sign-in
    if (data.session) {
      router.push('/protected');
    } else {
      router.push('/sign-in');
    }
  }

  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-background font-karla">
      {/* === Animated Navigation Bar === */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: showNav ? 0 : -100 }}
        // CUSTOMIZABLE: Animation speed and style
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 bg-background border-b border-secondary-dark z-50"
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* CUSTOMIZABLE: Logo size */}
              <KrammyLogo width={40} height={40} />
              {/* CUSTOMIZABLE: Brand name */}
              <span className="text-foreground text-lg font-light">Krammy</span>
            </div>
            <div className="flex items-center space-x-6">
              {/* Updated Login link with auth check */}
              <Link 
                href="#" 
                onClick={async (e) => {
                  e.preventDefault();
                  const { data } = await supabase.auth.getSession();
                  if (data.session) {
                    router.push('/protected');
                  } else {
                    router.push('/sign-in');
                  }
                }} 
                className="text-text-light hover:text-foreground"
              >
                Login
              </Link>
              {/* The Get Started button will use handleGetStartedClick */}
              <button 
                onClick={handleGetStartedClick} 
                className="px-4 py-2 bg-primary text-background-light rounded-lg hover:bg-primary-dark"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* === Hero Section === */}
      <div className="min-h-screen flex items-center justify-center p-4 pt-20 pb-24 relative">
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center">
          {/* Left Column - Value Proposition */}
          <div className="w-full md:w-1/2 md:pr-12 flex flex-col items-center mb-8 md:mb-0">
            <div className="flex flex-col items-center mb-8 md:mb-16">
              {/* CUSTOMIZABLE: Logo size */}
              <KrammyLogo width={72} height={72} />
              {/* CUSTOMIZABLE: Main logo text */}
              <h1 className="text-3xl md:text-4xl text-foreground font-light">Krammy</h1>
            </div>

            {/* CUSTOMIZABLE: Animated headline texts and timing */}
            <h2 className="text-4xl md:text-5xl font-medium mb-6 md:mb-8 text-primary text-center">
              <TypeAnimation
                sequence={[
                  'Learn Smarter,',
                  2000,
                  'Study Faster',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="block"
              />
            </h2>

            {/* CUSTOMIZABLE: Main tagline first part */}
            <p className="text-lg text-text mb-2 text-center px-4 md:px-0">
              Transform your study notes into <strong>interactive typing exercises</strong>.
            </p>

            {/* CUSTOMIZABLE: Main tagline second part */}
            <p className="text-lg text-text mb-8 md:mb-16 text-center px-4 md:px-0">
              <strong>Master your material</strong> while improving your typing speed.
            </p>

            {/* CUSTOMIZABLE: Main CTA button text */}
            <button
              onClick={handleGetStartedClick} 
              className="bg-primary text-background-light px-6 py-3 rounded-lg text-lg font-semibold hover:bg-primary-dark transition"
            >
              Get Started
            </button>
          </div>

          {/* Right Column - Image Carousel */}
          <div className="w-full md:w-1/2 bg-secondary rounded-2xl p-6 sm:p-8 mx-auto my-4 
                          relative overflow-hidden max-w-lg max-h-[500px]">
            <FeatureShowcase />
          </div>
        </div>
        
        {/* CUSTOMIZABLE: "Learn more" button text */}
        <button
          onClick={scrollToFeatures}
          className="flex flex-col items-center absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-foreground hover:text-primary transition-colors"
          aria-label="Learn more about features"
        >
          <span className="mb-1">Learn more</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5" />
          </svg>
        </button>
      </div>

      {/* === Features Section === */}
      {/* NOTE: To customize features, edit the FeatureBanner component */}
      <div ref={featuresRef}>
        <FeatureBanner />
      </div>

      {/* === CTA Section === */}
      <section className="py-24 bg-background text-foreground">
        <div className="max-w-3xl mx-auto text-center px-6">
          {/* CUSTOMIZABLE: CTA headline */}
          <h2 className="text-3xl font-semibold mb-6">
            Ready to improve your typing and learning?
          </h2>
          {/* CUSTOMIZABLE: CTA subheading */}
          <p className="text-text-light mb-8">
            Join students who are already learning faster and typing better.
          </p>
          {/* CUSTOMIZABLE: CTA button text */}
          <button 
            onClick={handleGetStartedClick}
            className="px-6 py-3 bg-primary text-background-light rounded-lg hover:bg-primary-dark transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* === Footer === */}
      <footer>
        <div className="max-w-5xl mx-auto px-6 py-12 flex justify-between items-center">
          {/* CUSTOMIZABLE: Footer brand name */}
          <span className="font-medium text-foreground">Krammy</span>
          {/* CUSTOMIZABLE: Copyright text */}
          <p className="text-sm text-text-light">© 2025 Krammy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}