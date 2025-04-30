/**
 * FLASHCARD STACK COMPONENT
 * 
 * This component manages the flashcard learning experience including:
 * - Card navigation and animations
 * - Progress tracking and statistics
 * - Persistent storage of user progress
 * - Keyboard navigation
 * - Completion screen with performance metrics
 */

"use client"
import { useState, useEffect, useCallback } from "react"
import TypingExercise from "./flashcard"
import { ChevronLeft, ChevronRight, RotateCcw, Award } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { FlashCard } from "@/types/FlashCard";
import Link from "next/link";

interface FlashcardStackProps {
  flashcards: FlashCard[];  // Array of flashcards to display
  deckId?: string | number; // Unique identifier for the deck (for storage)
}

export default function FlashcardStack({ flashcards = [], deckId = 'default' }: FlashcardStackProps) {
  // --- STATE MANAGEMENT ---
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [stats, setStats] = useState<Array<{ wpm: number; accuracy: number }>>([]);

  // --- STORAGE KEYS ---
  // CUSTOMIZATION: Change the storage prefix if needed for different use cases
  const storagePrefix = `flashcard_deck_${deckId}`;
  const indexKey = `${storagePrefix}_index`;
  const statsKey = `${storagePrefix}_stats`;

  // --- LOAD DATA FROM STORAGE ---
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

  // --- SAVE DATA TO STORAGE ---
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(indexKey, currentCardIndex.toString());
      localStorage.setItem(statsKey, JSON.stringify(stats));
    }
  }, [currentCardIndex, stats, isInitialized, indexKey, statsKey]);

  // --- NAVIGATION HANDLERS ---
  const handleNextCard = useCallback(() => {
    setDirection('next');
    // Check if this is the last card
    if (currentCardIndex === flashcards.length - 1) {
      setIsDeckCompleted(true);
    } else {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }
  }, [currentCardIndex, flashcards.length]);

  const handlePreviousCard = useCallback(() => {
    setDirection('previous');
    // Timeout ensures smooth animation transition
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }, 0);
  }, [flashcards.length]);

  // --- KEYBOARD NAVIGATION ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDeckCompleted) return; // Don't navigate if deck is completed
      
      // CUSTOMIZATION: You can change these keys to any keys you prefer
      if (e.key === 'ArrowLeft') {
        handlePreviousCard();
      } else if (e.key === 'ArrowRight') {
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeckCompleted, handleNextCard, handlePreviousCard]);

  // --- LOADING STATE ---
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        {/* CUSTOMIZATION: Change the loading spinner appearance here */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!flashcards.length) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-[var(--color-background-light)] rounded-xl shadow-md">
        {/* CUSTOMIZATION: Change the empty state message here */}
        <p className="text-[var(--color-text-light)]">No flashcards available</p>
      </div>
    );
  }

  // --- ANIMATION VARIANTS ---
  // CUSTOMIZATION: Modify these values to change card transition animations
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

  // --- CARD COMPLETION HANDLER ---
  const handleCardComplete = (wpm: number, accuracy: number) => {
    const newStats = [...stats];
    newStats[currentCardIndex] = { wpm, accuracy };
    setStats(newStats);
    
    // Move to next card if available
    handleNextCard();
  };

  // --- RESTART HANDLER ---
  const handleRestart = () => {
    setCurrentCardIndex(0);
    setStats([]);
    setIsDeckCompleted(false);
    localStorage.removeItem(statsKey);
    localStorage.setItem(indexKey, '0');
  }

  // --- STATISTICS CALCULATOR ---
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

  // --- COMPLETION SCREEN ---
  if (isDeckCompleted) {
    const { avgWpm, avgAccuracy } = calculateStats();
    const validStats = stats.filter(stat => stat !== null && stat !== undefined);

    return (
      <div className="w-full flex flex-col items-center justify-center p-6">
        <div className="bg-[var(--color-card-light)] rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden">
          {/* CUSTOMIZATION: Change the header gradient and icon here */}
          <div className="bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-primary)]/30 to-[var(--color-primary)]/20 px-8 py-6 flex items-center justify-center">
            <div className="bg-[var(--color-primary)]/20 rounded-full p-4">
              <Award className="h-12 w-12 text-[var(--color-primary)]" />
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-8 flex flex-col items-center">
            {/* CUSTOMIZATION: Change completion messages here */}
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-dark)] mb-2">
              Congratulations!
            </h2>
            <p className="text-[var(--color-text)] text-center mb-6">
              You've completed the entire deck!
            </p>
            
            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              {/* CUSTOMIZATION: Change stat box design here */}
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
            
            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              {/* CUSTOMIZATION: Change button link and styling here */}
              <Link 
                href="/protected"
                className="flex-1 py-3 px-4 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-xl hover:bg-[var(--color-secondary-dark)] transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Decks
              </Link>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Practice Again
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress streak visualization - only show if there are valid stats */}
        {validStats.length > 0 && (
          <div className="mt-12 w-full max-w-xl">
            <h3 className="text-xl font-medium text-[var(--color-text-dark)] mb-4 text-center">
              Your progress
            </h3>
            {/* CUSTOMIZATION: Change the progress visualization styles here */}
            <div className="flex gap-2 justify-center flex-wrap">
              {stats.map((stat, index) => 
                stat ? (
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
                  <div key={index} className="h-3 w-12 rounded-full bg-gray-300" />
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN FLASHCARD VIEW ---
  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="relative h-[310px]">
          {/* CUSTOMIZATION: Change the stack effect appearance here */}
          <div className="absolute inset-0 bg-[var(--color-card-dark)] rounded-lg transform rotate-1 z-0"></div>
          <div className="absolute inset-0 bg-[var(--color-card-medium)] rounded-lg transform -rotate-1 z-0"></div>

          {/* Card content with animations */}
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

      {/* CUSTOMIZATION: Change navigation controls appearance here */}
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

      {/* CUSTOMIZATION: Change stats display appearance here */}
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