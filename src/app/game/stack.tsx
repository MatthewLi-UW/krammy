/*
THIS FILE HANDLES THE STACK OF FLASHCARDS
*/

"use client"
import { useState, useEffect } from "react"
import TypingExercise from "./flashcard"
import { ChevronLeft, ChevronRight, RotateCcw, Award, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { FlashCard } from "@/types/FlashCard";
import Link from "next/link";
import { sentDeckStats } from "@/utils/sendData";
import { User } from "@/types/user";
import { supabase } from "@/utils/supabase/client";
import { getDeckStats } from "@/utils/getData";

// Add a deck ID parameter to the props
interface FlashcardStackProps {
  flashcards: FlashCard[];
  deckId?: string | number;
}

export default function FlashcardStack({ flashcards = [], deckId = 'default' }: FlashcardStackProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [stats, setStats] = useState<Array<{ wpm: number; accuracy: number }>>([]);
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  //  localStorage key to be deck-specific
  const storagePrefix = `flashcard_deck_${deckId}`;
  const indexKey = `${storagePrefix}_index`;
  const statsKey = `${storagePrefix}_stats`;

  // localStorage load effect
  useEffect(() => {
    // Reset states when deck changes
    setCurrentCardIndex(0);
    setStats([]);
    
    const saved = localStorage.getItem(indexKey);
    const savedStats = localStorage.getItem(statsKey);
    
    if (saved) {
      const parsedIndex = parseInt(saved, 10);
      // Make sure we don't go out of bounds
      if (parsedIndex < flashcards.length) {
        setCurrentCardIndex(parsedIndex);
      }
    }
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    setIsInitialized(true);
  }, [flashcards.length, deckId]);

  // localStorage save effect
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(indexKey, currentCardIndex.toString());
      localStorage.setItem(statsKey, JSON.stringify(stats));
    }
  }, [currentCardIndex, stats, isInitialized, indexKey, statsKey]);

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // If no flashcards are provided, return a placeholder
  if (!flashcards.length) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-[var(--color-background-light)] rounded-xl shadow-md">
        <p className="text-[var(--color-text-light)]">No flashcards available</p>
      </div>
    );
  }
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
      } else {
        const temp = data.user as User;
        setUser(temp ? { 
          id: temp.id, 
          email: temp.email,
          image: temp.user_metadata?.avatar_url || undefined
        } : null);
      }
    }

  const handleNextCard = () => {
    setDirection('next');
    // Check if this is the last card
    if (currentCardIndex === flashcards.length - 1) {
      setIsDeckCompleted(true);
    } else {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }
  }

  const handlePreviousCard = () => {
    setDirection('previous');
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }, 0);
  }

  const cardVariantsNext = {
    hidden: { x: 0, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.2 } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.4 } },
  };

  const cardVariantsPrevious = {
    hidden: { x: -50, opacity: 0, transition: { duration: 0.2 } },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { x: 0, opacity: 0 },
  };

  
  const handleCardComplete = (wpm: number, accuracy: number) => {
    const newStats = [...stats];
    newStats[currentCardIndex] = { wpm, accuracy };
    setStats(newStats);
    
    // Move to next card if available
    handleNextCard();
  };

  //  restart function
  const handleRestart = () => {
    setCurrentCardIndex(0);
    setStats([]);
    setIsDeckCompleted(false);
    localStorage.removeItem(statsKey);
    localStorage.setItem(indexKey, '0');
  }

  const calculateStats = () => {
    // Filter out any null or undefined stats first
    const validStats = stats.filter(stat => stat !== null && stat !== undefined);
    
    if (validStats.length === 0) {
      return { avgWpm: 0, avgAccuracy: 0 };
    }
    
    const avgWpm = Math.round(
      validStats.reduce((sum, stat) => sum + stat.wpm, 0) / validStats.length
    );
    
    const avgAccuracy = Math.round(
      validStats.reduce((sum, stat) => sum + stat.accuracy, 0) / validStats.length
    );
    
    return { avgWpm, avgAccuracy };
  };

  if (isDeckCompleted) {
    fetchUser();
    const { avgWpm, avgAccuracy } = calculateStats();

    if (user){
      getDeckStats(user.id, Number(deckId))
      //sentDeckStats(user.id,Number(deckId),avgAccuracy,avgWpm);
    }
    
    return (
      <div className="w-full flex flex-col items-center justify-center p-6">
        <div className="bg-[var(--color-card-light)] rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden">
          {/* Header section with gradient and celebration icon */}
          <div className="bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-primary)]/30 to-[var(--color-primary)]/20 px-8 py-6 flex items-center justify-center">
            <div className="bg-[var(--color-primary)]/20 rounded-full p-4">
              <Award className="h-12 w-12 text-[var(--color-primary)]" />
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-8 flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-dark)] mb-2">
              Congratulations!
            </h2>
            <p className="text-[var(--color-text)] text-center mb-6">
              You've completed the entire deck!
            </p>
            
            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              <div className="bg-[var(--color-background-light)] rounded-xl p-5 flex flex-col items-center">
                <div className="text-[var(--color-primary)] mb-1">Average WPM</div>
                <div className="text-2xl font-bold text-[var(--color-text-dark)]">
                  {avgWpm}
                </div>
              </div>
              
              <div className="bg-[var(--color-background-light)] rounded-xl p-5 flex flex-col items-center">
                <div className="text-[var(--color-primary)] mb-1">Average Accuracy</div>
                <div className="text-2xl font-bold text-[var(--color-text-dark)]">
                  {avgAccuracy}%
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <button 
                onClick={() => {
                  setIsDeckCompleted(false);
                  setCurrentCardIndex(0);
                  setStats([]);
                }}
                className="flex-1 py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Deck
              </button>
              
              <Link 
                href="/protected"
                className="flex-1 py-3 px-4 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-xl hover:bg-[var(--color-secondary-dark)] transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Decks
              </Link>
            </div>
          </div>
        </div>
        
        {/* Progress streak visualization */}
        <div className="mt-12 w-full max-w-xl">
          <h3 className="text-xl font-medium text-[var(--color-text-dark)] mb-4 text-center">
            Your progress
          </h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {stats
              .map((stat, index) => 
                stat ? ( // Only render if stat exists
                  <div 
                    key={index}
                    className="group relative cursor-help"
                  >
                    <div 
                      className={`h-3 w-12 rounded-full ${
                        stat.accuracy > 90 ? 'bg-green-500' : 
                        stat.accuracy > 75 ? 'bg-[var(--color-primary)]' : 
                        stat.accuracy > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--color-card-dark)] text-white rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Card {index + 1}: {stat.wpm} WPM / {stat.accuracy}% accuracy
                    </div>
                  </div>
                ) : (
                  <div key={index} className="h-3 w-12 rounded-full bg-gray-300" /> // Placeholder for skipped cards
                )
              )}
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="relative h-[310px]">
          {/* Stack effect */}
          <div className="absolute inset-0 bg-[var(--color-card-dark)] rounded-lg transform rotate-1 z-0"></div>
          <div className="absolute inset-0 bg-[var(--color-card-medium)] rounded-lg transform -rotate-1 z-0"></div>

          {/* Animate Presence ensures smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={direction === 'next' ? cardVariantsNext : cardVariantsPrevious}
              className="absolute inset-0 flex justify-center items-center"
            >
              <TypingExercise
                key={`card-${currentCardIndex}`}
                front={currentCard.front || ''}
                back={currentCard.back || ''}
                onNextCard={handleCardComplete}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex space-x-8 relative z-[10]">
        <button
          onClick={handlePreviousCard}
          className="p-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none hover-pulse"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-md shadow-md font-serif">
          {currentCardIndex + 1} / {flashcards.length}
        </div>
        
        <button
          onClick={handleNextCard}
          className="p-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none hover-pulse"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Average Stats */}
      {stats.length > 0 && (
        <div className="flex gap-4 text-sm mt-4">
          <span className="text-[var(--color-primary)] bg-[var(--color-background-light)] px-3 py-1 rounded-full shadow-sm">
            {calculateStats().avgWpm} WPM
          </span>
          <span className="text-[var(--color-primary)] bg-[var(--color-background-light)] px-3 py-1 rounded-full shadow-sm">
            {calculateStats().avgAccuracy}% Accuracy
          </span>
        </div>
      )}
    </div>
  );
}