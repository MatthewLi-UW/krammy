"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { flashcards } from './flashcard_array';

const FlashcardList = ({ onSelectCard }) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
        {flashcards.map((card, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCard(index)}
          >
            <div className="p-6">
              <div className="font-medium text-lg mb-3">
                {card.front}
              </div>
              <div className="w-full h-px bg-gray-200 mb-3" />
              <div className="text-gray-600">
                {card.back}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardList;