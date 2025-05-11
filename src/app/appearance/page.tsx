'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";
import Loading from '@/app/components/loading';
import { useTheme } from '@/app/themeprovider';

export default function AppearancePage() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Auth check
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
        return;
      } else {
        const temp = data.user as User;
        setUser(temp ? { 
          id: temp.id, 
          email: temp.email,
          image: temp.user_metadata?.avatar_url || undefined
        } : null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="flex flex-col min-h-screen bg-background dark:bg-background-dark transition-colors duration-200 font-karla">
      <Header user={user} />
      
      <div className="w-full max-w-4xl mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-8">Appearance</h1>
        
        {/* Theme Switcher */}
        <section className="bg-background-light dark:bg-background rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Choose Your Theme</h2>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground dark:text-foreground-light">Theme</h3>
            
            {/* Theme selector grid - include all options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Default theme */}
              <div 
                onClick={() => {
                  setTheme('krammy');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'krammy' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-[#FFFAEC]`}
              >
                <div className="bg-[#2A9D8F] h-3 w-12 rounded mb-2"></div>
                <div className="bg-[#F5ECD5] h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-[#4A4A4A]">Krammy</span>
                {theme === 'krammy' && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Dark theme */}
              <div 
                onClick={() => {
                  setTheme('midnight');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'midnight' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-[#121212]`}
              >
                <div className="bg-[#2A9D8F] h-3 w-12 rounded mb-2"></div>
                <div className="bg-[#333333] h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-[#EDEDED]">Midnight</span>
                {theme === 'midnight' && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Blue theme */}
              <div 
                onClick={() => {
                  setTheme('ocean-blue');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'ocean-blue' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-blue-100`}
              >
                <div className="bg-blue-500 h-3 w-12 rounded mb-2"></div>
                <div className="bg-blue-200 h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Ocean Blue</span>
                {theme === 'ocean-blue' && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Lavender theme */}
              <div 
                onClick={() => {
                  setTheme('faerie-lavender');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'faerie-lavender' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-purple-100`}
              >
                <div className="bg-purple-500 h-3 w-12 rounded mb-2"></div>
                <div className="bg-purple-200 h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Faerie Lavender</span>
                {theme === 'faerie-lavender' && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Mint Berry theme */}
              <div 
                onClick={() => {
                  setTheme('mint-berry');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'mint-berry' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-red-100`}
              >
                <div className="bg-red-500 h-3 w-12 rounded mb-2"></div>
                <div className="bg-red-200 h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Mint Berry</span>
                {theme === 'mint-berry' && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Coming Soon theme */}
              <div 
                className="relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 border-transparent bg-green-100 opacity-60 cursor-not-allowed"
              >
                <div className="bg-green-600 h-3 w-12 rounded mb-2 opacity-70"></div>
                <div className="bg-green-200 h-3 w-16 rounded opacity-70"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Coming Soon</span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg backdrop-blur-[1px]">
                  <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold transform -rotate-12">Soon</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-text-light dark:text-text-light mt-2">
              Current theme: {
                theme === 'krammy' ? 'Krammy' : 
                theme === 'midnight' ? 'Midnight' :
                theme === 'ocean-blue' ? 'Ocean Blue' :
                theme === 'faerie-lavender' ? 'Faerie Lavender' :
                theme === 'forest' ? '' :
                theme === 'mint-berry' ? 'Mint Berry' : 'Custom'
              }
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}