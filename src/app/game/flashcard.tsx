/*
THIS FILE HANDLES A SPECIFIC TYPING FLASHCARD
*/

'use client';
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Volume2, Star } from 'lucide-react';

// Character states type
type CharacterState = {
  char: string;
  state: 'correct' | 'error' | 'pending' | 'remaining';
};

interface TypingExerciseProps {
  front: string;
  back: string;
  onNextCard: (wpm: number, accuracy: number) => void;
}

const TypingExercise: React.FC<TypingExerciseProps> = ({ front, back, onNextCard}) => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // card flip
  const [isFlipped, setIsFlipped] = useState(true);

  // for cursor movement
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });

  const [showTooltip, setShowTooltip] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  // for tts
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key == 'r') {
        if (!isFlipped) {
            e.preventDefault();
            e.stopPropagation();
            handleReset();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped]);

    // Initialize characters when back prop changes
    useEffect(() => {
        const chars = back.split('').map(char => ({
        char,
        state: 'remaining' as const
        }));
        setCharacters(chars);
        // Reset input and other states when card changes
        setInput('');
        setStartTime(null);
        setCurrentIndex(0);
        setCursorCoords({ x: 0, y: 0 });

        // Ensure the card always starts on the front
        setIsFlipped(true);
    }, [back]);  // Depend on back prop instead of text


  const calculateCursorPosition = () => {
    if (!textContainerRef.current) return;

    const currentCharIndex = input.length;
    
    // Get the container's position
    const containerRect = textContainerRef.current.getBoundingClientRect();
    
    // Handle the case when we're at the start (no input)
    if (currentCharIndex === 0 && wordsRef.current[0]) {
      const firstCharRect = wordsRef.current[0].getBoundingClientRect();
      setCursorCoords({
        x: firstCharRect.left - containerRect.left,
        y: firstCharRect.top - containerRect.top
      });
      return;
    }

    // Get the previous character's element (if it exists)
    const prevCharElement = wordsRef.current[currentCharIndex - 1];
    
    if (prevCharElement) {
      const charRect = prevCharElement.getBoundingClientRect();
      setCursorCoords({
        x: charRect.left - containerRect.left + charRect.width,
        y: charRect.top - containerRect.top
      });
    }
  };

  useEffect(() => {
    calculateCursorPosition();
  }, [input]);

  const calculateMetrics = () => {
    if (!startTime) return { wpm: 0, accuracy: 0 };

    // Calculate time taken in minutes
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;

    // Count correct and total characters
    const totalChars = characters.length;
    const correctChars = characters.filter(char => char.state === 'correct').length;

    // Standard WPM calculation (5 characters = 1 word)
    const words = back.length / 5;
    const wpm = Math.round(words / timeElapsed);

    // Calculate accuracy percentage
    const accuracy = Math.round((correctChars / totalChars) * 100);

    return { wpm, accuracy };
  };

  // handleInput function
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ignore typing input when the front of the card is visible
    if (isFlipped) {
      return;
    }

    if (!startTime) setStartTime(Date.now());
    const newInput = e.target.value;
    // this makes it so you cant type after reaching the end, but i think it lags it
    // if (input.length >= back.length) return;
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

    // If user reaches the end, calculate metrics and move to next card
    if (newInput.length === back.length) {
      const { wpm, accuracy } = calculateMetrics();
      setTimeout(() => onNextCard(wpm, accuracy), 250);
    }
  };

const handleFlip = (e: React.MouseEvent<HTMLElement> | KeyboardEvent): void => {
    if (e instanceof KeyboardEvent || !(e.target instanceof Element) || !e.target.closest('svg')) {
        setIsFlipped(!isFlipped);
    }
};

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key == 'Enter') {
            e.stopPropagation();
            handleFlip(e);
        }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped]);

  const cursorStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${cursorCoords.x}px`,
    top: `${cursorCoords.y}px`,
    transform: 'translateY(-50%)',  // Center vertically
    height: '1.2em',               // Reduced from 1.4em
    width: '2px',
    backgroundColor: 'var(--color-primary)', // Using CSS variable instead of hardcoded #0d9488
    marginTop: '0.6em',           // Add offset to align with text
    transition: 'all 0.1s ease-out', // Add smooth transition
    willChange: 'left, top'         // Optimize performance
  };

  const handleReset = () => {
    setInput('');
    setStartTime(null);
    setCurrentIndex(0);
    setCursorCoords({ x: 0, y: 0 });
  
    // Ensure we're only resetting the current flashcard's characters
    setCharacters(back.split('').map(char => ({
      char,
      state: 'remaining'
    })));
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
        const utterance = new SpeechSynthesisUtterance(back);
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
            transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            height: '300px'
          }}
        >
          <div 
            className="absolute w-full h-full p-8 rounded-lg bg-[var(--color-card-light)] flex flex-col shadow-lg"
            onClick={handleFlip}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Top icons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSpeak}
                className="focus:outline-none focus:ring-0"
              >
                <Volume2 
                  className={`w-6 h-6 ${
                    isSpeaking ? 'text-[var(--color-text-light)]' : 'text-[var(--color-primary)]'
                  } transition-colors hover:opacity-80`} 
                />
              </button>
              <Star className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            
            {/* Centered text content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative overflow-visible w-full">
                <div 
                  ref={textContainerRef}
                  
                  className="text-lg leading-relaxed whitespace-pre-wrap relative overflow-visible font-serif"
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
                        char.state === 'pending' ? 'text-[var(--color-text-light)]' :
                        char.state === 'error' ? 'text-[var(--color-error-text)]' :
                        char.state === 'correct' ? 'text-[var(--color-primary)]' :
                        'text-[var(--color-text)]'
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
            </div>

            {/* Bottom reset button */}
            <div className="flex items-center justify-center mt-auto">
                <button 
                    onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="p-2 rounded-full transition-colors duration-300 relative"
                >
                    <RotateCcw className="w-6 h-6 text-[var(--color-primary)]" />

                    {/* Tooltip - Updated to use theme variables */}
                    <div 
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 
                        bg-[var(--color-text-dark)] text-[var(--color-card-light)] text-xs py-1 px-2 rounded whitespace-nowrap
                        transition-all duration-300 ease-in-out pointer-events-none
                        ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                    >
                    Restart Card (CTRL + R)
                    </div>
                </button>
            </div>

          </div>

          <div 
            className="absolute w-full h-full p-8 rounded-lg bg-[var(--color-card-light)] cursor-pointer flex flex-col shadow-lg"
            onClick={handleFlip}
            style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)'
            }}
            > 
            {/* Empty space at top */}
            <div className="flex-1" />
            
            {/* Centered header */}
            <h1 className="text-3xl font-bold text-center text-[var(--color-text-dark)]">
                {front}
            </h1>
            
            {/* Empty space in middle */}
            <div className="flex-1" />
            
            {/* Bottom instruction text */}
            <div className="text-center text-[var(--color-text-light)] text-sm">
                Ctrl + Enter to flip
            </div>
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