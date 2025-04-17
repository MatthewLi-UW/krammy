'use client';

import { FlashCard } from "@/types/FlashCard";

interface VerticalListProps {
  flashcards: FlashCard[];
  deckName: string;
}

export default function VerticalList({ flashcards, deckName }: VerticalListProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 border-b-2 border-teal-500 pb-3">
        {deckName} - Flashcard List
      </h2>
      
      <div className="space-y-6">
        {flashcards.map((card) => (
          <div 
            key={card.card_id} 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:w-1/2 bg-gradient-to-r from-teal-50 to-white border-b md:border-b-0 md:border-r border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Term</h3>
                <p className="text-xl text-gray-800">{card.front}</p>
              </div>
              <div className="p-6 md:w-1/2">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Definition</h3>
                <p className="text-xl text-gray-800">{card.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}