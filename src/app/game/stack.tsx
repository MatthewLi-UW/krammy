/*
THIS FILE HANDLES THE STACK OF FLASHCARDS
*/

"use client"
import type React from "react"
import { useState } from "react"
import TypingExercise from "./flashcard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { flashcards } from "./flashcard_array";

const FlashcardStack: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');

  const handleNextCard = () => {
    setDirection('next');
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 0);
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

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="relative h-[310px]">
          {/* Stack effect */}
          <div className="absolute inset-0 bg-[#d2be9c] rounded-lg transform rotate-1 z-0"></div>
          <div className="absolute inset-0 bg-[#e6d8c3] rounded-lg transform -rotate-1 z-0"></div>

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
                onNextCard={handleNextCard}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex space-x-8 relative z-[10]">
        <button
          onClick={handlePreviousCard}
          className="p-2 rounded-full bg-[#2A9D8F] text-white shadow-md transition-all duration-300 ease-in-out hover:bg-card-medium hover:text-card-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-card-dark hover-pulse"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="px-4 py-2 bg-[#faf3eb] text-gray-800 rounded-md shadow-md font-serif">
          {currentCardIndex + 1} / {flashcards.length}
        </div>
        
        <button
          onClick={handleNextCard}
          className="p-2 rounded-full bg-[#2A9D8F] text-white shadow-md transition-all duration-300 ease-in-out hover:bg-card-medium hover:text-card-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-card-dark hover-pulse"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardStack;