'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";
import { getData } from '@/utils/getData';
import { cardsPerDeck } from '@/utils/getData';
import Loading from '@/app/components/loading';

export default function StatsPage() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    lastActivity: 'N/A',
    avgWpm: 0,
    avgAccuracy: 0,
  });

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

  const fetchPerformanceMetrics = async (userId: string) => {
    try {
      const { data: metricsData, error } = await supabase
        .from('DeckMetrics')
        .select('wpm, accuracy')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (metricsData && metricsData.length > 0) {
        // Filter out invalid entries
        const validEntries = metricsData.filter(item => 
          item.wpm !== null && 
          item.accuracy !== null && 
          !isNaN(item.wpm) && 
          !isNaN(item.accuracy)
        );
        
        if (validEntries.length === 0) return { avgWpm: 0, avgAccuracy: 0 };
        
        // Calculate average WPM (more safely)
        const totalWpm = validEntries.reduce((sum, item) => sum + Number(item.wpm || 0), 0);
        const avgWpm = Math.round(totalWpm / validEntries.length);
        
        // Calculate average accuracy (more safely)
        const totalAccuracy = validEntries.reduce((sum, item) => {
          // If stored as decimal (e.g., 0.95), convert to percentage
          const accuracyValue = item.accuracy <= 1 ? item.accuracy * 100 : item.accuracy;
          return sum + Number(accuracyValue || 0);
        }, 0);
        
        const avgAccuracy = Math.round(totalAccuracy / validEntries.length);
        
        // Ensure accuracy doesn't exceed 100%
        return { 
          avgWpm, 
          avgAccuracy: avgAccuracy > 100 ? 100 : avgAccuracy 
        };
      }
      
      return { avgWpm: 0, avgAccuracy: 0 };
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      return { avgWpm: 0, avgAccuracy: 0 };
    }
  };

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

        // Fetch performance metrics
        const performanceMetrics = await fetchPerformanceMetrics(user.id);
        
        setStats({
          totalDecks: userDecks.length,
          totalCards: totalCards,
          lastActivity: new Date().toLocaleDateString(),
          avgWpm: performanceMetrics.avgWpm,
          avgAccuracy: performanceMetrics.avgAccuracy,
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
    <main className="flex flex-col min-h-screen bg-background dark:bg-background-dark transition-colors duration-200 font-karla">
      <Header user={user} />
      
      <div className="w-full max-w-4xl mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-8">Your Statistics</h1>
        
        {/* Stats Section */}
        <section className="bg-background-light dark:bg-background rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Performance Metrics */}
            <div className="bg-secondary/50 dark:bg-secondary-dark/50 p-6 rounded-lg ">
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-6">Performance</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-text-light dark:text-text-light">Average Speed</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{stats.avgWpm} <span className="text-sm font-normal">WPM</span></p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-text-light dark:text-text-light">Average Accuracy</p>
                  </div>
                  <p className="text-3xl font-bold text-green-500">{stats.avgAccuracy}%</p>
                </div>
              </div>
            </div>
            
            {/* Content Metrics */}
            <div className="bg-secondary/50 dark:bg-secondary-dark/50 p-6 rounded-lg l-4">
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-6">Content</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <p className="text-sm text-text-light dark:text-text-light">Total Decks</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">{stats.totalDecks}</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-text-light dark:text-text-light">Total Cards</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">{stats.totalCards}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional activity info */}
          <div className="bg-secondary/30 dark:bg-secondary-dark/30 p-4 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-light mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-text-light dark:text-text-light">Last Activity: <span className="font-medium">{stats.lastActivity}</span></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}