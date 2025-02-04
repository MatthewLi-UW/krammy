'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.2, ease: "easeOut" }  // Increased duration
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.3  // Increased stagger delay
    }
  }
}

const navAnimation = {
  initial: { opacity: 0, y: -30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.5  // Added delay for dramatic effect
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 text-gray-100">
      {/* Navbar */}
      <motion.nav 
        initial="initial"
        animate="animate"
        variants={navAnimation}
        className="border-b border-gray-800 backdrop-blur-lg bg-gray-900/30 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}  // Slower hover
              className="flex items-center space-x-2"
            >
              <Image src="/krammy_logo.png" alt="Krammy" width={30} height={30} />
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold text-2xl">
                Krammy
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}>
                <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300">
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}>
                <Link 
                  href="/upload" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all duration-500"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}>
                <Link 
                  href="" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all duration-500"
                >
                  Type
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={stagger}
        className="relative"
      >
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/keyboard_bg.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center relative">
          <motion.h1 
            variants={{
              initial: { opacity: 0, y: 50 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.5, ease: "easeOut", delay: 1 }
              }
            }}
            className="text-6xl font-bold tracking-tight"
          >
            Learn Smarter,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Type Faster
            </span>
          </motion.h1>
          <motion.p 
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.5, ease: "easeOut", delay: 1.3 }
              }
            }}
            className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Transform your study notes into interactive typing exercises. 
            Master your material while improving your typing speed.
          </motion.p>
          <motion.div 
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.5, ease: "easeOut", delay: 1.6 }
              }
            }}
            className="mt-10"
          >
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all duration-500 inline-flex items-center space-x-2 hover:scale-105 transform"
            >
              Start Learning Free
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Features */}
      <div className="py-24 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature cards */}
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
                title: "Smart Note Processing",
                description: "Our AI analyzes your notes and creates personalized study materials."
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: "Type to Memorize",
                description: "Boost retention through active recall and typing exercises."
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                title: "Track Progress",
                description: "Monitor your improvement with detailed analytics."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, y: 50 },
                  animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 1.5, ease: "easeOut", delay: index * 0.3 }
                  }
                }}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.5 }  // Slower hover
                }}
                className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="py-24"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2 
            variants={{
              initial: { opacity: 0, y: 50 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.5, ease: "easeOut" }
              }
            }}
            className="text-3xl font-bold"
          >
            Ready to revolutionize your study routine?
          </motion.h2>
          <motion.p 
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.5, ease: "easeOut", delay: 0.3 }
              }
            }}
            className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Join thousands of students who are already learning faster and remembering more.
          </motion.p>
          <motion.div 
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 1.5, ease: "easeOut", delay: 0.6 }
              }
            }}
            className="mt-10"
          >
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all duration-500 hover:scale-105 transform"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}
            className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
          >
            Krammy
          </motion.div>
          <p className="text-sm text-gray-400">© 2024 Krammy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}