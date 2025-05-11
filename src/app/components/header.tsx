'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserIcon, LogOutIcon, SettingsIcon, UserCircleIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KrammyLogo from './logo';
import { signOutAction } from '../actions';

interface HeaderProps {
  user: {
    id: string;
    email: string;
    image?: string; // Optional profile image URL
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex justify-between items-center p-6">
      {/* Logo and brand name */}
      <Link href="/" className="flex items-center gap-3">
        <KrammyLogo width={40} height={40} />
        <span className="text-2xl font-bold text-text">Krammy</span>
      </Link>
      
      {/* Right side elements: My Decks button + Profile */}
      <div className="flex items-center">
        {user && (
          <Link 
            href="/protected" 
            className="px-4 py-2 mr-3 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] rounded-md shadow-sm font-medium transition-all duration-200 flex items-center"
          >
            My Decks
          </Link>
        )}
        
        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={toggleDropdown}
            className="cursor-pointer rounded-full p-1 flex items-center justify-center"
            style={{ width: '48px', height: '48px' }}
          >
            {user?.image ? (
              <Image 
                src={user.image} 
                alt="Profile" 
                width={44} 
                height={44} 
                className="rounded-full object-cover"
              />
            ) : (
              <Image 
                src="/profile_placeholder.png" 
                alt="Profile" 
                width={44} 
                height={44} 
                className="rounded-full object-cover"
              />
            )}
          </div>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-[var(--color-background-light)] rounded-md shadow-lg z-10 py-1 border border-[var(--color-secondary)] origin-top-right"
              >
                <div className="px-4 py-3 border-b border-[var(--color-secondary)]">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate max-w-full" title={user?.email || "User"}>
                    {user?.email || "User"}
                  </p>
                </div>
                
                <Link 
                  href="/protected" 
                  className="flex items-center px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-secondary-light)]"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserIcon size={16} className="mr-2 shrink-0" />
                  My Decks
                </Link>
                
                <Link 
                  href="/settings" 
                  className="flex items-center px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-secondary-light)]"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <SettingsIcon size={16} className="mr-2 shrink-0" />
                  Settings
                </Link>
                
                <button 
                  onClick={signOutAction}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--color-secondary-light)]"
                >
                  <LogOutIcon size={16} className="mr-2 shrink-0" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}