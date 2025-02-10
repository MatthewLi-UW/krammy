'use client';
import React, { useState } from 'react';
import { RefreshCw, Volume2, Star } from 'lucide-react';

const TypingExercise = () => {
  const [text] = useState('over seem between with but where many great face world during to at have because high if group feel at after before year here think before time these life this own see mean people under take');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(true);
  
  const words = text.split(' ');
  const inputWords = input.split(' ');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startTime) setStartTime(Date.now());
    setInput(e.target.value);
  };

  const handleFlip = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('svg')) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
        <div 
          className={`relative w-full transition-transform duration-500`}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            height: '300px'
          }}
      >
        <div 
          className="absolute w-full h-full p-8 rounded-lg bg-[#faf3eb] cursor-pointer"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-end mb-6 space-x-4">
            <Volume2 className="w-6 h-6 text-green-700" />
            <Star className="w-6 h-6 text-green-700" />
          </div>
          
          <div className="mb-8">
            <div className="text-lg leading-relaxed whitespace-pre-wrap break-words">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className={`mr-2 ${
                    idx < inputWords.length - 1
                      ? inputWords[idx] === word
                        ? 'text-gray-400'
                        : 'text-red-500'
                      : idx === inputWords.length - 1
                      ? 'text-teal-600'
                      : 'text-gray-400'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
          </div>
        </div>

        <div 
          className="absolute w-full h-full p-8 rounded-lg bg-[#faf3eb] cursor-pointer flex items-center justify-center"
          onClick={handleFlip}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <h1 className="text-3xl font-bold text-center text-teal-600">
            Front of card
          </h1>
        </div>
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInput}
        className="fixed opacity-0"
        autoFocus
      />
      </div>
    </div>
  );
};

export default TypingExercise;