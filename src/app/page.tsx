'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { useRouter } from 'next/navigation'
import KrammyLogo from "@/app/components/logo"
import FeatureBanner from './landing-components/feature-banner'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // CUSTOMIZABLE: Carousel images - add or replace image paths here
  // Images should be placed in the public folder
  const carouselImages = [
    "/samplecards.png",
    "/krammy_logo.png",
    "/keyboard_bg.jpg"
  ]

  // *** EFFECTS & LIFECYCLE ***
  
  // Handle navigation visibility on scroll
  useEffect(() => {
    // CUSTOMIZABLE: Change 100 to adjust when the navigation bar appears on scroll
    const handleScroll = () => setShowNav(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Initialize and clean up carousel timer
  useEffect(() => {
    const startCarousel = () => {
      // CUSTOMIZABLE: Change 3000 to adjust carousel speed (value is in milliseconds)
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
      }, 3000)
    }

    startCarousel()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // *** EVENT HANDLERS ***
  
  // Reset carousel timer when manually changing image
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index)
    if (intervalRef.current) clearInterval(intervalRef.current)
    // CUSTOMIZABLE: Change 3000 to adjust carousel speed after manual navigation
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
    }, 3000)
  }

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
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-7xl flex items-center">
          {/* Left Column - Value Proposition */}
          <div className="w-1/2 pr-12 flex flex-col items-center">
            <div className="flex flex-col items-center mb-16">
              {/* CUSTOMIZABLE: Logo size */}
              <KrammyLogo width={72} height={72} />
              {/* CUSTOMIZABLE: Main logo text */}
              <h1 className="text-4xl text-foreground font-light">Krammy</h1>
            </div>

            {/* CUSTOMIZABLE: Animated headline texts and timing */}
            <h2 className="text-5xl font-medium mb-8 text-primary">
              <TypeAnimation
                sequence={[
                  'Learn Smarter,',  // First text
                  2000,              // Pause duration in ms
                  'Study Faster',    // Second text 
                  2000,              // Pause duration in ms
                ]}
                wrapper="span"
                speed={50}           // Typing speed
                repeat={Infinity}
                className="block"
              />
            </h2>

            {/* CUSTOMIZABLE: Main tagline first part */}
            <p className="text-lg text-foreground mb-2 text-center">
              Transform your study notes into <strong>interactive typing exercises</strong>.
            </p>

            {/* CUSTOMIZABLE: Main tagline second part */}
            <p className="text-lg text-foreground mb-16 text-center">
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
          <div className="w-1/2 bg-secondary rounded-2xl p-6 relative overflow-hidden">
            {/* CUSTOMIZABLE: Carousel container height */}
            <div className="w-full h-[400px] flex justify-center items-center">
              <Image 
                src={carouselImages[currentImageIndex]} 
                alt="Krammy Application Preview" 
                width={500}  // CUSTOMIZABLE: Image max width
                height={400} // CUSTOMIZABLE: Image max height
                className="object-contain transition-opacity duration-500"
              />
            </div>
            
            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button 
                  key={index} 
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex 
                      ? 'bg-primary' // Use primary color for active dot
                      : 'bg-gray-300 dark:bg-gray-600' // Use specific colors for inactive dots
                  } transition-colors duration-300`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`View image ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
        
        {/* CUSTOMIZABLE: "Learn more" button text */}
        <button
          onClick={scrollToFeatures}
          className="flex flex-col items-center absolute bottom-8 left-1/2 transform -translate-x-1/2 text-foreground hover:text-primary transition-colors"
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