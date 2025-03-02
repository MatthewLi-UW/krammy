/*
THIS FILE HANDLES THE STACK OF FLASHCARDS
*/

"use client"
import type React from "react"
import { useState, useEffect } from "react"
import TypingExercise from "./flashcard"
import { ChevronLeft, ChevronRight, RotateCcw, Award, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { flashcards } from "./flashcard_array";

const FlashcardStack: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [cardStats, setCardStats] = useState<Array<{ wpm: number; accuracy: number }>>([]);

  // Move localStorage logic to a useEffect
  useEffect(() => {
    const saved = localStorage.getItem('currentCardIndex');
    const savedStats = localStorage.getItem('cardStats');
    if (saved) {
      setCurrentCardIndex(parseInt(saved, 10));
    }
    if (savedStats) {
      setCardStats(JSON.parse(savedStats));
    }
    setIsInitialized(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('currentCardIndex', currentCardIndex.toString());
      localStorage.setItem('cardStats', JSON.stringify(cardStats));
    }
  }, [currentCardIndex, cardStats, isInitialized]);

  // Don't render until initialized
  if (!isInitialized) {
    return null; // or a loading spinner
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
    setCardStats(prev => [...prev, { wpm, accuracy }]);
  }

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setCardStats([]);
    setIsDeckCompleted(false);
    localStorage.removeItem('cardStats');
    localStorage.setItem('currentCardIndex', '0');
  }

  const calculateAverages = () => {
    if (cardStats.length === 0) return { avgWpm: 0, avgAccuracy: 0 };
    
    const total = cardStats.reduce((acc, stat) => ({
      wpm: acc.wpm + stat.wpm,
      accuracy: acc.accuracy + stat.accuracy
    }), { wpm: 0, accuracy: 0 });

    return {
      avgWpm: Math.round(total.wpm / cardStats.length),
      avgAccuracy: Math.round(total.accuracy / cardStats.length)
    };
  }

  if (isDeckCompleted) {
    const { avgWpm, avgAccuracy } = calculateAverages()

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
                front={flashcards[currentCardIndex].front}
                back={flashcards[currentCardIndex].back}
                onNextCard={(wpm, accuracy) => {
                  handleCardComplete(wpm, accuracy);
                  handleNextCard();
                }}
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
    </div>
  );
};

export default FlashcardStack;
