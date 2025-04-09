/*
THIS FILE HANDLES THE STACK OF FLASHCARDS
*/

"use client"
import { useState, useEffect } from "react"
import TypingExercise from "./flashcard"
import { ChevronLeft, ChevronRight, RotateCcw, Award, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { FlashCard } from "@/types/FlashCard";

// Add a deck ID parameter to the props
interface FlashcardStackProps {
  flashcards: FlashCard[];
  deckId?: string | number; // Add this line
}

export default function FlashcardStack({ flashcards = [], deckId = 'default' }: FlashcardStackProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [stats, setStats] = useState<Array<{ wpm: number; accuracy: number }>>([]);

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
  }, [flashcards.length, deckId]); // Add deckId as a dependency

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If no flashcards are provided, return a placeholder
  if (!flashcards.length) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-white rounded-xl shadow-md">
        <p className="text-gray-400">No flashcards available</p>
      </div>
    );
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

  const calculateAverages = () => {
    if (stats.length === 0) return { avgWpm: 0, avgAccuracy: 0 };
    
    // Filter out undefined entries
    const validStats = stats.filter(stat => stat !== undefined && stat !== null);
    
    if (validStats.length === 0) return { avgWpm: 0, avgAccuracy: 0 };
    
    const total = validStats.reduce((acc, stat) => ({
      wpm: acc.wpm + stat.wpm,
      accuracy: acc.accuracy + stat.accuracy
    }), { wpm: 0, accuracy: 0 });

    return {
      avgWpm: Math.round(total.wpm / validStats.length),
      avgAccuracy: Math.round(total.accuracy / validStats.length)
    };
  }

  if (isDeckCompleted) {
    const { avgWpm, avgAccuracy } = calculateAverages();

    return (
      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-teal to-card-dark rounded-lg shadow-2xl p-8 text-center text-card-light"
        >
          <motion.h2
            className="text-4xl font-bold mb-6 text-card-light"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            🎉 Congratulations!
          </motion.h2>
          <div className="space-y-6 mb-8">
            <motion.div
              className="flex items-center justify-center space-x-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Zap className="w-8 h-8 text-card-light" />
              <p className="text-2xl text-card-light">
                Average WPM: <span className="font-bold">{avgWpm}</span>
              </p>
            </motion.div>
            <motion.div
              className="flex items-center justify-center space-x-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Award className="w-8 h-8 text-card-light" />
              <p className="text-2xl text-card-light">
                Average Accuracy: <span className="font-bold">{avgAccuracy}%</span>
              </p>
            </motion.div>
          </div>
          <motion.button
            onClick={handleRestart}
            className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-card-light text-teal rounded-full shadow-md transition-all duration-300 hover:bg-card-medium hover:text-teal hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-semibold">Restart Deck</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="relative h-[310px]">
          {/* Stack effect */}
          <div className="absolute inset-0 bg-card-dark rounded-lg transform rotate-1 z-0"></div>
          <div className="absolute inset-0 bg-card-medium rounded-lg transform -rotate-1 z-0"></div>

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
                key={`card-${currentCardIndex}`} // Add this line
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
          className="p-2 rounded-full bg-teal hover:bg-teal-button_hover text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none hover-pulse"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="px-4 py-2 bg-[#faf3eb] text-gray-800 rounded-md shadow-md font-serif">
          {currentCardIndex + 1} / {flashcards.length}
        </div>
        
        <button
          onClick={handleNextCard}
          className="p-2 rounded-full bg-teal hover:bg-teal-button_hover text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none hover-pulse"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Average Stats */}
      {stats.length > 0 && (
        <div className="flex gap-4 text-sm mt-4">
          <span className="text-teal-600 bg-white px-3 py-1 rounded-full shadow-sm">
            {calculateAverages().avgWpm} WPM
          </span>
          <span className="text-teal-600 bg-white px-3 py-1 rounded-full shadow-sm">
            {calculateAverages().avgAccuracy}% Accuracy
          </span>
        </div>
      )}
    </div>
  );
}