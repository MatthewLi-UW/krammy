'use client';
import { useState } from 'react';
import TypingExercise from '../game/page';

type Flashcard = {
  front: string;
  back: string;
};

const convertApiResponseToFlashcards = (response: any): Flashcard[] => {
  return response.map((item: any) => ({
    front: item.front,
    back: item.back
  }));
};

export default function PracticePage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/your-endpoint');
      const data = await response.json();
      const newFlashcards = convertApiResponseToFlashcards(data.content);
      setFlashcards(newFlashcards);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Practice Page</h1>
      <button 
        onClick={generateFlashcards}
        disabled={loading}
        className="mb-8 px-6 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Flashcards'}
      </button>
      {flashcards.length > 0 && <TypingExercise flashcards={flashcards} />}
    </div>
  );
}