'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import KrammyLogo from "@/app/components/logo"

export default function LandingPage() {
  const [showNav, setShowNav] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [email, setEmail] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://yourapp.com";

  const carouselImages = [
    "/samplecards.png",
    "/krammy_logo.png",
    "/keyboard_bg.jpg"
  ];

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startCarousel = () => {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % carouselImages.length
        );
      }, 3000); // Change image every 3 seconds
    };

    startCarousel();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 3000);
  };

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

  if (!isMounted|| !router) return null;

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const signUpRedirectAction = () => {
    if (email) {
      router.push(`/sign-up?email=${encodeURIComponent(email)}`);
    }
  };

  const handleGetStartedClick = () => {
    router.push('/upload');
  };

  const handleLoginClick = () => {
    router.push('/sign-in');
  }

  return (
    <div className="min-h-screen bg-beige-light font-karla">
      {/* Sticky navigation - appears on scroll */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: showNav ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50"
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex items-center space-x-2">
              <KrammyLogo width={40} height={40} />
              <span className="text-gray-dark text-lg font-light">Krammy</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <button 
                onClick={handleGetStartedClick} 
                className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-button_hover"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Landing Page Content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl flex items-center">
          {/* Left Column */}
          <div className="w-1/2 pr-12 flex flex-col items-center">
            <div className="flex flex-col items-center mb-16">
              <KrammyLogo width={72} height={72} />
              <h1 className="text-4xl text-gray-dark font-light">Krammy</h1>
            </div>

            <h2 className="text-5xl font-light mb-8 text-text-teal">
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
            </h2>

            <p className="text-lg text-gray-dark mb-2 text-center">
              Transform your study notes into <strong>interactive typing exercises</strong>.
            </p>

            <p className="text-lg text-gray-dark mb-16 text-center">
              <strong>Master your material</strong> while improving your typing speed.
            </p>

            {/* Sign-in section */}
            <button
            onClick={handleLoginClick} 
            className="bg-teal text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-teal-600 transition">
              Get Started
            </button>
          </div>

          {/* Right Column - Carousel */}
          <div className="w-1/2 bg-beige-medium rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button 
                  key={index} 
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-gray-dark' : 'bg-gray-light'
                  }`}
                  onClick={() => handleDotClick(index)}
                ></button>
              ))}
            </div>

            <div className="w-full h-[400px] flex justify-center items-center">
              <Image 
                src={carouselImages[currentImageIndex]} 
                alt="Carousel Image" 
                width={500} 
                height={400} 
                className="object-contain transition-opacity duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features section with gradient fade effect */}
      <div className="relative">
        {/* Top gradient fade from beige-light to white */}
        {/* <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-beige-light to-beige-medium z-10"></div> */}
        
        <div className="bg-beige-medium relative shadow-md">
          {/* Features section */}
          <section className="py-24">
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-12 text-gray-dark">
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
        </div>
        
        {/* Bottom gradient fade from white to beige-light */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-beige-light to-beige-medium z-10"></div> */}
      </div>

      {/* CTA Section */}
      <section className="py-24 bg-beige-light text-gray-dark">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to improve your typing and learning?
          </h2>
          <p className="text-gray-600 mb-8">
            Join students who are already learning faster and typing better.
          </p>
          <button 
            onClick={handleGetStartedClick}
            className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal-button_hover transition-colors"
          >
            Get Started Free
          </button>
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
  )
}