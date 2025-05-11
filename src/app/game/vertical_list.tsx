'use client';

import { FlashCard } from "@/types/FlashCard";
import Link from "next/link";

interface VerticalListProps {
  flashcards: FlashCard[];
  deckName: string;
  deckId: string | number;
}

export default function VerticalList({ flashcards, deckName, deckId }: VerticalListProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-primary)] pb-3">
        <h2 className="text-3xl font-bold text-[var(--color-text-dark)]">
          {deckName} - Flashcard List
        </h2>
        
        <Link 
          href={`/edit?deckId=${deckId}`}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Deck
        </Link>
      </div>
      
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