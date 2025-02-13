/*
THIS FILE HANDLES IS USELESS FOR NOW
*/

// 'use client';
// import { useState } from 'react';

// interface Flashcard {
//   id: string;
//   front: string;
//   back: string;
// }

// interface TypingGameProps {
//   flashcards: Flashcard[];
// }

// export default function TypingGame({ flashcards }: TypingGameProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [userInput, setUserInput] = useState('');

//   if (!flashcards.length) return null;

//   const currentCard = flashcards[currentIndex];

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setUserInput(e.target.value);
//     if (e.target.value === currentCard.back) {
//       if (currentIndex < flashcards.length - 1) {
//         setCurrentIndex(prev => prev + 1);
//         setUserInput('');
//       }
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-sm">
//       <div className="mb-6">
//         <h3 className="text-lg font-semibold mb-2">Question:</h3>
//         <p className="text-gray-700">{currentCard.front}</p>
//       </div>
//       <div>
//         <input
//           type="text"
//           value={userInput}
//           onChange={handleInputChange}
//           className="w-full p-3 border rounded"
//           placeholder="Type the answer..."
//         />
//       </div>
//     </div>
//   );
// }