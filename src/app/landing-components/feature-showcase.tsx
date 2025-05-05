import { AnimatePresence, motion } from "framer-motion";
import { FileText, Star } from "lucide-react";
import { sleep } from "openai/core.mjs";
import { useEffect, useState, useRef } from "react";

/**
 * UploadAnimation Component
 * 
 * Demonstrates the PDF upload and processing experience.
 * Shows animation sequence: initial → hover → dropping → processing → complete
 */
const UploadAnimation = () => {
  const [animationState, setAnimationState] = useState('initial');
  
  // CUSTOMIZATION: Modify these timings to adjust animation speed
  const timings = {
    hover: 1200,
    dropping: 1000,
    processing: 800,
    complete: 1400,
    reset: 2200
  };
  
  useEffect(() => {
    const sequence = async () => {
      setAnimationState('initial');
      await sleep(timings.hover);
      setAnimationState('hover');
      await sleep(timings.dropping);
      setAnimationState('dropping');
      await sleep(timings.processing);
      setAnimationState('processing');
      await sleep(timings.complete);
      setAnimationState('complete');
      await sleep(timings.reset);
      // Uncomment below to make animation loop continuously
      // sequence();
    };
    
    sequence();
  }, []);
  
  return (
    <motion.div className="relative w-full h-64 bg-background/90 rounded-xl border-gray-300 flex items-center justify-center">
      {/* PDF file animation */}
      <motion.div 
        className="absolute flex flex-col items-center justify-center"
        initial={{ top: "10%", left: "50%", x: "-50%", opacity: 0 }}
        animate={{ 
          top: animationState === 'dropping' ? "50%" : "10%",
          y: animationState === 'dropping' ? "-50%" : 0,
          opacity: animationState === 'initial' ? 0 : 
                  animationState === 'hover' ? 0.7 : 
                  animationState === 'processing' ? 0 : 1
        }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        {/* CUSTOMIZATION: Change file icon or appearance */}
        <div className="relative">
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">PDF</span>
          </div>
          <FileText size={48} className="text-red-500 drop-shadow-md" />
        </div>
        {/* CUSTOMIZATION: Change file name */}
        <span className="text-xs mt-1 text-gray-500">course_notes.pdf</span>
      </motion.div>
      
      {/* Status text */}
      <motion.div 
        className="absolute bottom-8 left-0 right-0 text-center"
        animate={{
          opacity: animationState === 'initial' ? 0.8 :
                  animationState === 'hover' ? 1 :
                  animationState === 'dropping' ? 0.5 :
                  animationState === 'processing' ? 0.8 :
                  animationState === 'complete' ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* CUSTOMIZATION: Customize status messages */}
        {animationState === 'complete' 
          ? <span className="text-green-500 font-medium">PDF processed! 12 flashcards created</span>
          : animationState === 'processing'
          ? <span className="text-gray-600">Analyzing document...</span>
          : <span className="text-gray-600">Drop your PDF here</span>
        }
      </motion.div>
      
      {/* Upload area highlight effect */}
      <motion.div 
        className="absolute inset-0 rounded-xl bg-primary/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: animationState === 'hover' ? 0.3 : 
                  animationState === 'dropping' ? 0.5 : 0 
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Progress indicator */}
      {animationState === 'processing' && (
        <motion.div 
          className="absolute bottom-4 left-1/2 w-3/4 h-2 bg-gray-200 rounded-full overflow-hidden"
          initial={{ x: "-50%" }}
        >
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2 }}
          />
        </motion.div>
      )}
      
      {/* Success checkmark */}
      {animationState === 'complete' && (
        <motion.div
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * TypingAnimation Component
 * 
 * Demonstrates the interactive typing experience on flashcards
 * with a flip animation and typing effect.
 */
const TypingAnimation = () => {
  // CUSTOMIZATION: Change the card content here
  const title = "Dual-coding theory";
  const text = "Dual-coding theory holds that memory is enhanced by forming semantic and visual codes.";
  
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Update cursor position while typing
  useEffect(() => {
    if (textRef.current && typedText.length > 0) {
      const textContainer = textRef.current;
      const lastCharSpan = textContainer.childNodes[typedText.length - 1] as HTMLSpanElement;
      if (lastCharSpan) {
        const containerRect = textContainer.getBoundingClientRect();
        const spanRect = lastCharSpan.getBoundingClientRect();
        const position = spanRect.right - containerRect.left;
        setCursorPosition(position);
      }
    } else {
      setCursorPosition(0);
    }
  }, [typedText]);
  
  // Card flip animation sequence
  useEffect(() => {
    const sequence = async () => {
      // Reset states
      setIsFlipped(false);
      setTypedText("");
      setCurrentIndex(0);
      setTypingStarted(false);
      
      // CUSTOMIZATION: Adjust timing for showing front of card
      await sleep(1500);
      
      // Flip the card
      setIsFlipped(true);
      
      // Wait for flip animation before typing
      await sleep(800);
      setTypingStarted(true);
    };
    
    sequence();
  }, []);
  
  // Typing effect
  useEffect(() => {
    if (!typingStarted) return;
    
    if (currentIndex < text.length) {
      // CUSTOMIZATION: Adjust typing speed here
      const typingSpeed = 80; // Base typing speed
      const randomVariation = 50; // Random variation to make typing look natural
      
      const timeout = setTimeout(() => {
        setTypedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed + Math.random() * randomVariation);
      
      return () => clearTimeout(timeout);
    } else {
      // Reset after completion
      // CUSTOMIZATION: Adjust how long to wait after typing completes
      const pauseDelay = 3000;
      
      const resetTimer = setTimeout(() => {
        setIsFlipped(false);
        setTypedText("");
        setCurrentIndex(0);
        setTypingStarted(false);
        
        // Restart sequence
        // CUSTOMIZATION: Adjust timing for start of next cycle
        const newCardTimer = setTimeout(() => {
          setIsFlipped(true);
          setTimeout(() => setTypingStarted(true), 800);
        }, 1500);
        
        return () => clearTimeout(newCardTimer);
      }, pauseDelay);
      
      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex, typingStarted, text]);
  
  return (
    <div className="relative w-full max-w-lg mx-auto perspective-1000">
      <div 
        className="relative transition-transform duration-800 preserve-3d"
        style={{ 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s ease'
        }}
      >
        {/* Front of card */}
        <motion.div 
          className="absolute w-full bg-[var(--color-card-light)] rounded-xl p-6 shadow-lg backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            zIndex: isFlipped ? 0 : 1
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-center mt-6">
            <div className="h-4"></div>
          </div>

          <h3 className="text-xl font-medium text-center text-[var(--color-primary)] mb-2">
            {title}
          </h3>
          <div className="text-center text-gray-500 text-sm">Click to flip</div>
          <div className="flex justify-center mt-6">
            <div className="h-4"></div>
          </div>
        </motion.div>
        
        {/* Back of card */}
        <motion.div 
          className="absolute w-full bg-[var(--color-card-light)] rounded-xl p-6 shadow-lg backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            zIndex: isFlipped ? 1 : 0
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-lg font-medium text-[var(--color-text-dark)] mb-4">
            {title}
          </h3>
          
          <div className="relative min-h-[80px] font-serif break-words whitespace-pre-wrap">
            <div className="relative">
              <span ref={textRef} className="inline-block">
                {text.split('').map((char, index) => (
                  <span
                    key={index}
                    className={index < typedText.length 
                      ? "text-[var(--color-primary)]" 
                      : "text-[var(--color-text-light)]"}
                  >
                    {char}
                  </span>
                ))}
              </span>
              
              {/* Typing cursor */}
              {typingStarted && (
                <div
                  className="absolute inline-block w-0.5 bg-[var(--color-primary)]"
                  style={{
                    left: `${cursorPosition}px`,
                    top: '0.1em',
                    height: '1.2em',
                    transform: 'translateY(-50%)',  
                    marginTop: '0.6em',           
                    transition: 'left 0.1s ease-out',
                    willChange: 'left, top',
                    opacity: 1,
                  }}
                />
              )}
            </div>
          </div>
          
          {/* WPM counter */}
          <motion.div 
            className="absolute top-4 right-4 text-sm text-[var(--color-text-light)]"
            animate={{ opacity: typedText.length > 10 ? 1 : 0 }}
          >
            {/* CUSTOMIZATION: Adjust WPM calculation */}
            {Math.floor(typedText.length / 5 * (60 / 12))} WPM
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * ThemeAnimation Component
 * 
 * Shows different theme options available in the application
 * with smooth transitions between themes.
 */
const ThemeAnimation = () => {
  // CUSTOMIZATION: Add or modify theme options
  const themes = ["default", "midnight", "ocean-blue"];
  const [currentTheme, setCurrentTheme] = useState(0);
  
  useEffect(() => {
    // CUSTOMIZATION: Adjust theme rotation speed (3000ms = 3 seconds)
    const intervalTime = 3000;
    
    const interval = setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [themes.length]);
  
  // CUSTOMIZATION: Theme color mappings - modify colors here
  const themeColors = {
    default: {
      background: "#fffaec",
      header: "#f5ecd5",
      accent: "#2a9d8f",
      text: "#4a4a4a",
      card: "#faf3eb",
      secondary: "#e6d8c3",
    },
    midnight: {
      background: "#121212",
      header: "#333333",
      accent: "#2A9D8F",
      text: "#ededed",
      card: "#575757",
      secondary: "#333333",
    },
    "ocean-blue": {
      background: "#e8f5fb",
      header: "#dae4ff",
      accent: "#00bcd4",
      text: "#1e3a5f",
      card: "#edf2ff",
      secondary: "#b0c0ff",
    }
  };
  
  const currentThemeColors = themeColors[themes[currentTheme] as keyof typeof themeColors];
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Device frame */}
      <div className="relative rounded-xl overflow-hidden border-4 border-gray-800 aspect-[9/16] shadow-xl">
        {/* Screen that changes themes */}
        <motion.div 
          className="w-full h-full p-4"
          animate={{ backgroundColor: currentThemeColors.background }}
          transition={{ duration: 1 }}
        >
          {/* Header */}
          <motion.div 
            className="w-full h-12 rounded-lg mb-4 flex items-center px-3"
            animate={{ backgroundColor: currentThemeColors.header }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="w-8 h-8 rounded-full mr-3"
              animate={{ backgroundColor: currentThemeColors.accent }}
              transition={{ duration: 1 }}
            />
            <motion.div 
              className="h-4 w-20 rounded"
              animate={{ backgroundColor: currentThemeColors.text }}
              transition={{ duration: 1 }}
            />
          </motion.div>
          
          {/* Card elements */}
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              className="w-full h-24 rounded-lg mb-3 p-4"
              animate={{ 
                backgroundColor: currentThemeColors.card,
                y: [0, -5, 0],
              }}
              transition={{ 
                backgroundColor: { duration: 1 },
                y: { delay: i * 0.2, duration: 0.5, ease: "easeInOut" }
              }}
            >
              <motion.div 
                className="h-3 w-20 rounded mb-2"
                animate={{ backgroundColor: currentThemeColors.accent }}
                transition={{ duration: 1 }}
              />
              <motion.div 
                className="h-3 w-full rounded mb-2"
                animate={{ backgroundColor: currentThemeColors.secondary }}
                transition={{ duration: 1 }}
              />
              <motion.div 
                className="h-3 w-3/4 rounded"
                animate={{ backgroundColor: currentThemeColors.secondary }}
                transition={{ duration: 1 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Theme label */}
      <motion.div 
        className="absolute bottom-[-30px] left-0 right-0 text-center font-medium"
        animate={{ color: currentThemeColors.accent }}
        transition={{ duration: 1 }}
      >
        {themes[currentTheme].split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')} Theme
      </motion.div>
    </div>
  );
};

/**
 * ProgressAnimation Component
 * 
 * Demonstrates the progress tracking feature with animated
 * statistics and achievement markers.
 */
const ProgressAnimation = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // CUSTOMIZATION: Adjust progress animation speed
    const progressSpeed = 50; // Lower = faster
    const progressIncrement = 0.5; // How much to increase each step
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + progressIncrement;
      });
    }, progressSpeed);
    
    return () => clearInterval(interval);
  }, []);
  
  // CUSTOMIZATION: Configure how metrics are calculated based on progress
  const accuracy = Math.floor(85 + (progress / 10));
  const streak = Math.floor(progress / 10);
  const wpm = Math.floor(40 + (progress / 4));
  
  // CUSTOMIZATION: Configure metrics display
  const metrics = [
    { label: "Accuracy", value: accuracy, suffix: "%" },
    { label: "Current Streak", value: streak, suffix: " days" },
    { label: "Average WPM", value: wpm, suffix: "" }
  ];
  
  return (
    <div className="w-full max-w-md mx-auto bg-[var(--color-card-light)] rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-medium text-[var(--color-text-dark)] mb-4">
        Your Learning Progress
      </h3>
      
      {/* Progress bar */}
      <div className="w-full h-3 bg-[var(--color-card-medium)] rounded-full mb-6 overflow-hidden">
        <motion.div 
          className="h-full bg-[var(--color-primary)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      
      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, i) => (
          <motion.div 
            key={i}
            className="bg-[var(--color-background-light)] p-3 rounded-lg text-center"
            animate={{ 
              y: [0, -3, 0],
              boxShadow: progress > (i+1) * 25 
                ? "0 4px 12px rgba(0,0,0,0.1)" 
                : "0 1px 3px rgba(0,0,0,0.05)"
            }}
            transition={{ 
              y: { 
                repeat: Infinity, 
                repeatDelay: 4, 
                duration: 1.5, 
                ease: "easeInOut" 
              },
              boxShadow: { duration: 0.8 }
            }}
          >
            <div className="text-sm text-[var(--color-text-light)]">{metric.label}</div>
            <div className="h-8 flex justify-center items-center">
              <motion.span 
                key={metric.value}
                className="text-lg font-bold text-[var(--color-primary)]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {metric.value}{metric.suffix}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Achievement stars */}
      <div className="flex justify-center space-x-4">
        {[...Array(5)].map((_, i) => {
          const isActive = progress > i * 20;
          return (
            <motion.div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              animate={{ 
                backgroundColor: isActive 
                  ? 'var(--color-primary)' 
                  : 'var(--color-card-medium)',
                opacity: isActive ? [0.9, 1] : [0.3, 0.4],
                scale: isActive ? [1, 1.08, 1] : 1,
                rotate: isActive ? [0, 5, 0] : 0 
              }}
              transition={{ 
                backgroundColor: { duration: 0.6 },
                opacity: { duration: 1, repeat: Infinity, repeatType: "reverse" },
                scale: { 
                  delay: i * 0.15, 
                  duration: 0.8, 
                  ease: "easeInOut" 
                },
                rotate: { 
                  delay: i * 0.15, 
                  duration: 0.8, 
                  ease: "easeInOut" 
                }
              }}
            >
              <Star className={`w-5 h-5 text-white transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * FeatureCarousel - Main Component
 * 
 * Displays all feature demos in a rotating carousel with navigation dots.
 */
const FeatureCarousel = () => {
  // CUSTOMIZATION: Configure features to display and their order
  const features = [
    { name: "Upload Files", component: <UploadAnimation /> },
    { name: "Type to Learn", component: <TypingAnimation /> },
    { name: "Custom Themes", component: <ThemeAnimation /> },
    { name: "Track Progress", component: <ProgressAnimation /> }
  ];
  
  const [currentFeature, setCurrentFeature] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to reset the timer
  const resetRotationTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // CUSTOMIZATION: Change rotation speed (milliseconds per feature)
    const rotationSpeed = 8000;
    
    intervalRef.current = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, rotationSpeed);
  };
  
  // Set up auto-rotation with timer
  useEffect(() => {
    resetRotationTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [features.length]);
  
  // Handler for dot clicks that includes timer reset
  const handleDotClick = (index: number) => {
    setCurrentFeature(index);
    resetRotationTimer(); // Reset the timer when manually changing features
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto py-16">
      {/* Feature navigation dots */}
      <div className="flex justify-center space-x-3 mb-12">
        {features.map((feature, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentFeature === i 
                ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)] ring-opacity-50" 
                : "bg-[var(--color-card-medium)] hover:bg-[var(--color-card-dark)]"
            }`}
            aria-label={`View ${feature.name}`}
          />
        ))}
      </div>
      
      {/* Feature display */}
      <div className="relative h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[var(--color-text-dark)] mb-8">
                {features[currentFeature].name}
              </h2>
              {features[currentFeature].component}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeatureCarousel;