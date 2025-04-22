'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";
import { getData } from '@/utils/getData';
import { cardsPerDeck } from '@/utils/getData';
import Loading from '@/app/components/loading';
import { useTheme } from '@/app/themeprovider';

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    lastActivity: 'N/A'
  });

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

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // Get user's decks
        const decks = await getData("Deck") as any[];
        const userDecks = decks?.filter(deck => deck.owner_id === user.id) || [];
        
        // Get total card count
        const deckIds = userDecks.map(deck => deck.deck_id) || [];
        const deckCounts = await cardsPerDeck(deckIds);
        const totalCards = deckCounts.reduce((sum, item) => sum + item.count, 0);
        
        setStats({
          totalDecks: userDecks.length,
          totalCards: totalCards,
          lastActivity: new Date().toLocaleDateString()
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    if (!loading && user) {
      fetchUserStats();
    }
  }, [loading, user]);

  if (loading) {
    return <Loading />;
  }

  return (
    // Main container
    <main className="flex flex-col min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
      <Header user={user} />
      
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-8">Settings</h1>
        
        {/* Stats Section */}
        <section className="bg-background-light dark:bg-background rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Your Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg">
              <p className="text-sm text-text-light dark:text-text-light">Total Decks</p>
              <p className="text-2xl font-bold text-primary">{stats.totalDecks}</p>
            </div>
            
            <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg">
              <p className="text-sm text-text-light dark:text-text-light">Total Cards</p>
              <p className="text-2xl font-bold text-primary">{stats.totalCards}</p>
            </div>
            
            <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg">
              <p className="text-sm text-text-light dark:text-text-light">Last Activity</p>
              <p className="text-2xl font-bold text-primary">{stats.lastActivity}</p>
            </div>
          </div>
        </section>
        
        {/* Theme Switcher - Monkeytype style */}
        <section className="bg-background-light dark:bg-background rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground dark:text-foreground-light">Theme</h3>
            
            {/* Theme selector grid - include all options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Default theme */}
              <div 
                onClick={() => {
                  setTheme('light');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'light' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-[#FFFAEC]`} // Hardcoded beige-light color
              >
                <div className="bg-[#2A9D8F] h-3 w-12 rounded mb-2"></div> {/* Hardcoded teal color */}
                <div className="bg-[#F5ECD5] h-3 w-16 rounded"></div> {/* Hardcoded beige-medium color */}
                <span className="mt-2 text-xs font-medium text-[#4A4A4A]">Default (Krammy)</span> {/* Hardcoded text color */}
                {theme === 'light' && (
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
                  setTheme('dark');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'dark' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-[#121212]`} // Hardcoded dark background
              >
                <div className="bg-[#2A9D8F] h-3 w-12 rounded mb-2"></div> {/* Hardcoded teal color */}
                <div className="bg-[#333333] h-3 w-16 rounded"></div> {/* Hardcoded dark gray color */}
                <span className="mt-2 text-xs font-medium text-[#EDEDED]">Dark</span> {/* Hardcoded light text color */}
                {theme === 'dark' && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Ocean Blue theme */}
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
                  setTheme('lavender');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'lavender' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-purple-100`}
              >
                <div className="bg-purple-500 h-3 w-12 rounded mb-2"></div>
                <div className="bg-purple-200 h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Lavender</span>
                {theme === 'lavender' && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Forest theme */}
              <div 
                onClick={() => {
                  setTheme('forest');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'forest' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-green-100`}
              >
                <div className="bg-green-600 h-3 w-12 rounded mb-2"></div>
                <div className="bg-green-200 h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Forest</span>
                {theme === 'forest' && (
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Ruby theme */}
              <div 
                onClick={() => {
                  setTheme('ruby');
                }}
                className={`cursor-pointer relative rounded-lg p-3 flex flex-col items-center justify-center aspect-video border-2 transition-all
                  ${theme === 'ruby' ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}
                  bg-red-100`}
              >
                <div className="bg-red-500 h-3 w-12 rounded mb-2"></div>
                <div className="bg-red-200 h-3 w-16 rounded"></div>
                <span className="mt-2 text-xs font-medium text-gray-900">Ruby</span>
                {theme === 'ruby' && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-text-light dark:text-text-light mt-2">
              Current theme: {
                theme === 'light' ? 'Default (Krammy)' : 
                theme === 'dark' ? 'Dark' :
                theme === 'ocean-blue' ? 'Ocean Blue' :
                theme === 'lavender' ? 'Lavender' :
                theme === 'forest' ? 'Forest' :
                theme === 'ruby' ? 'Ruby' : 'Custom'
              }
            </p>
          </div>
        </section>
        
        {/* Back button */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/protected')}
            className="px-4 py-2 bg-secondary dark:bg-secondary-dark text-foreground dark:text-foreground rounded-md hover:bg-secondary-dark dark:hover:bg-secondary transition-colors"
          >
            Back to Decks
          </button>
        </div>
      </div>
    </main>
  );
}