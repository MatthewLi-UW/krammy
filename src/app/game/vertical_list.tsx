'use client';

import { FlashCard } from "@/types/FlashCard";

interface VerticalListProps {
  flashcards: FlashCard[];
  deckName: string;
}

export default function VerticalList({ flashcards, deckName }: VerticalListProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-[var(--color-text-dark)] border-b-2 border-[var(--color-primary)] pb-3">
        {deckName} - Flashcard List
      </h2>
      
      <div className="space-y-6">
        {flashcards.map((card) => (
          <div 
            key={card.card_id} 
            className="bg-[var(--color-card-light)] rounded-xl shadow-md overflow-hidden border border-[var(--color-card-medium)]/50 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:w-1/2 bg-[var(--color-secondary)]/30 border-b md:border-b-0 md:border-r border-[var(--color-card-medium)]/30">
                <h3 className="text-lg font-medium text-[var(--color-text-dark)] mb-1">Term</h3>
                <p className="text-xl text-[var(--color-text-dark)]">{card.front}</p>
              </div>
              <div className="p-6 md:w-1/2">
                <h3 className="text-lg font-medium text-[var(--color-text-dark)] mb-1">Definition</h3>
                <p className="text-xl text-[var(--color-text-dark)]">{card.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}