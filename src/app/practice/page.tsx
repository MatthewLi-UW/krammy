// 'use client';
// import { useState } from 'react';
// import TypingGame from '@/app/game/typing';

// export default function PracticePage() {
//   const [flashcards, setFlashcards] = useState<Array<{ id: string; front: string; back: string }>>([]);

//   const createSampleFlashcard = () => {
//     const sampleFlashcard = {
//       id: '1',
//       front: 'What is the capital of France?',
//       back: 'The capital of France is Paris.'
//     };
//     setFlashcards([sampleFlashcard]);
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-6">Practice Page</h1>
//       <button 
//         onClick={createSampleFlashcard}
//         className="mb-8 px-6 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors"
//       >
//         Create Sample Flashcard
//       </button>
//       <TypingGame flashcards={flashcards} />
//     </div>
//   );
// }

'use client';
import { useState } from 'react';
import TypingGame from '@/app/game/typing';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function PracticePage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const convertApiResponseToFlashcards = (apiResponse: string) => {
    // Assuming API response is in format: Q1: question A1: answer
    const pairs = apiResponse.split('\n');
    return pairs.map((pair, index) => {
      const [question, answer] = pair.split('Back:').map(str => str.trim());
      return {
        id: index.toString(),
        front: question.replace('Front:', '').trim(),
        back: answer
      };
    });
  };

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      // Get API response from your existing API call
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Your study material here' })
      });
      
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
      {flashcards.length > 0 && <TypingGame flashcards={flashcards} />}
    </div>
  );
}