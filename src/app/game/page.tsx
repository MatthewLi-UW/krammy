'use client';
import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Volume2, Star } from 'lucide-react';

// Add this new type and state
type CharacterState = {
  char: string;
  state: 'correct' | 'error' | 'pending' | 'remaining';
};

const TypingExercise = () => {
  const [text] = useState('over seem between with but where many great face world during to at have because high if group feel at after before year here think before time these life this own see mean people under take');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Add this state near other state declarations
  const [characters, setCharacters] = useState<CharacterState[]>([]);

  // Add isSpeaking state near other state declarations
  const [isSpeaking, setIsSpeaking] = useState(false);

  const words = text.split(' ');

  useEffect(() => {
    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'r') {
        if (!isFlipped) {
          e.preventDefault();
          handleReset();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped]);

  const calculateCursorPosition = () => {
    if (!textContainerRef.current) return;

    const currentCharIndex = input.length;
    // Change condition to include last character
    if (currentCharIndex >= 0 && currentCharIndex <= wordsRef.current.length) {
      let charElement = wordsRef.current[currentCharIndex];
      // For the last character, use the last element's position plus its width
      if (!charElement && currentCharIndex === wordsRef.current.length) {
        charElement = wordsRef.current[currentCharIndex - 1];
        if (!charElement) return;

        const containerRect = textContainerRef.current.getBoundingClientRect();
        const charRect = charElement.getBoundingClientRect();
        
        // Add character width for final position
        const x = charRect.left - containerRect.left + charRect.width;
        const y = charRect.top - containerRect.top;

        setCursorCoords({ x, y });
        return;
      }
      if (!charElement) return;

      const containerRect = textContainerRef.current.getBoundingClientRect();
      const charRect = charElement.getBoundingClientRect();
      
      const x = charRect.left - containerRect.left;
      const y = charRect.top - containerRect.top;

      setCursorCoords({ x, y });
    }
  };

  useEffect(() => {
    calculateCursorPosition();
  }, [input]);

  // Initialize characters in useEffect
  useEffect(() => {
    const chars = text.split('').map(char => ({
      char,
      state: 'remaining'
    }));
    setCharacters(chars);
  }, [text]);

  // Update handleInput function
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startTime) setStartTime(Date.now());
    const newInput = e.target.value;
    setInput(newInput);

    const newChars = [...characters];
    for (let i = 0; i < characters.length; i++) {
      if (i < newInput.length) {
        newChars[i].state = newInput[i] === characters[i].char ? 'correct' : 'error';
      } else {
        newChars[i].state = 'remaining';
      }
    }
    setCharacters(newChars);
    calculateCursorPosition();
  };

  const getWordStyle = (word, index) => {
    const inputWords = input.trim().split(' ');
    const currentWord = inputWords[index] || '';
    
    if (index < currentIndex) {
      return 'text-gray-400';
    } else if (index === inputWords.length - 1) {
      const isMatch = word.startsWith(currentWord);
      return isMatch ? 'text-teal-600' : 'text-red-500';
    }
    return 'text-gray-800';
  };

  const handleFlip = (e) => {
    if (!(e.target as HTMLElement).closest('svg')) {
      setIsFlipped(!isFlipped);
    }
  };

  const cursorStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${cursorCoords.x}px`,
    top: `${cursorCoords.y}px`,
    transform: 'translateY(-50%)',  // Center vertically
    height: '1.2em',               // Reduced from 1.4em
    width: '2px',
    backgroundColor: '#0d9488',
    marginTop: '0.6em',           // Add offset to align with text
    transition: 'all 0.1s ease-out', // Add smooth transition
    willChange: 'left, top'         // Optimize performance
  };

  const handleReset = () => {
    setInput('');
    setStartTime(null);
    setCurrentIndex(0);
    setCursorCoords({ x: 0, y: 0 });
    // Reset all character states to 'remaining'
    const resetChars = characters.map(char => ({
      ...char,
      state: 'remaining'
    }));
    setCharacters(resetChars);
  };

  // Add handleSpeak function before return statement
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        // Cancel current speech
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Start new speech
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
        <div 
          className="relative w-full transition-transform duration-500"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            height: '300px'
          }}
        >
          <div 
            className="absolute w-full h-full p-8 rounded-lg bg-[#faf3eb]"
            onClick={handleFlip}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex justify-end mb-6 space-x-4">
              <button
                onClick={handleSpeak}
                className="focus:outline-none focus:ring-0"
              >
                <Volume2 
                  className={`w-6 h-6 ${
                    isSpeaking ? 'text-gray-400' : 'text-teal-600'
                  } transition-colors hover:opacity-80`} 
                />
              </button>
              <Star className="w-6 h-6 text-teal-600" />
            </div>
            
            <div className="mb-8 relative overflow-visible">
              {/* Update the JSX rendering part */}
              <div 
                ref={textContainerRef}
                className="text-lg leading-relaxed whitespace-pre-wrap relative overflow-visible"
                style={{ 
                  wordBreak: 'keep-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  width: '100%',
                  hyphens: 'none'
                }}
              >
                {characters.map((char, idx) => (
                  <span
                    key={idx}
                    ref={el => { wordsRef.current[idx] = el; }}
                    className={`${
                      char.state === 'pending' ? 'text-gray-400' :
                      char.state === 'error' ? 'text-red-500' :
                      char.state === 'correct' ? 'text-teal-600' :
                      'text-gray-400'
                    }`}
                  >
                    {char.char}
                  </span>
                ))}
                <div 
                  style={cursorStyle} 
                  className="pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="p-2 rounded-full transition-colors"
              >
                <RefreshCw className="w-6 h-6 text-teal-600 hover:animate-spin" />
              </button>
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
          ref={inputRef}
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