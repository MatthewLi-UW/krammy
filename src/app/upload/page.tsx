'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {createDeck, sendData} from '@/utils/sendData'
import { User } from "@/types/user";
import { Deck } from "@/types/Deck";
import { FlashCard } from "@/types/FlashCard";
import { supabase } from "@/utils/supabase/client";
import Loading from '@/app/components/loading';
import Header from '@/app/components/header';
import { ArrowLeft, Upload } from 'lucide-react';

export default function UploadPage() {
  // Add an authentication loading state
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const [detailLevel, setDetailLevel] = useState(1) // For the slider (1-3 range)
  const [deckName, setDeckName] = useState('')
  const [flashcardArray, setFlashcardArray] = useState<{front: string, back: string}[]>([])
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const fetchUser = async () => {
    setIsAuthLoading(true); // Set loading to true when starting auth check
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/sign-in");
    } else {
      const temp = data.user as User;
      setUser(temp ? { 
        id: temp.id, 
        email: temp.email,
        image: temp.user_metadata?.avatar_url || undefined
      } : null);
    }
    setIsAuthLoading(false); // Auth check complete
  }

  // Call fetchUser on page load
  useEffect(() => {
    fetchUser();
  }, []);

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return <Loading />
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'text/plain' || droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
    } else {
      setError('Please upload a .txt or .pdf file')
    }
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleTextInput = (e) => {
    setText(e.target.value)
  }
  
  const handleDeckNameChange = (e) => {
    setDeckName(e.target.value)
  }
  
  const handleDetailLevelChange = (e) => {
    const value = parseFloat(e.target.value);
    
    // Snap to nearest integer if within 0.15 of it
    if (Math.abs(value - Math.round(value)) < 0.15) {
      setDetailLevel(Math.round(value));
    } else {
      setDetailLevel(value);
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResponse('')

    try {
      let content = text

      if (file) {
        // Different handling based on file type
        if (file.type === 'application/pdf') {
          // Use the new Flask PDF parser for PDF files
          const formData = new FormData();
          formData.append('pdf', file);
          
          const uploadResponse = await fetch('http://localhost:5000/api/parse-pdf', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to parse PDF');
          }
          
          const uploadResult = await uploadResponse.json();
          content = uploadResult.text;
        } 
        else if (file.type === 'text/plain') {
          // Keep existing logic for text files
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Upload failed');
          }
          
          const uploadResult = await uploadResponse.json();
          content = uploadResult.text;
        }
        else {
          throw new Error('Unsupported file type. Please upload a .txt or .pdf file');
        }
      }

      console.log("Sending to API:", {
        content: content.substring(0, 100) + "...", // Log just the beginning
        deckName,
        detailLevel
      });

      const aiResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, deckName, detailLevel })
      })

      if (!aiResponse.ok) throw new Error('Processing failed')

      const result = await aiResponse.json()
      console.log('API process response:', result)
      
      // Parse the response text into flashcard array format
      if (result.success && result.responseText) {
        // Log original response for debugging
        console.log('Original API response text:', result.responseText);
        
        // Remove the header if it exists (like "**Flashcards:**")
        let responseText = result.responseText.replace(/^\*\*Flashcards:\*\*\s*\n+/i, '');
        
        // Handle any format of "Front:" and "Back:" with or without asterisks
        // This will match Front/Back labels with any combination of asterisks
        responseText = responseText.replace(/\*{0,2}Front\*{0,2}:/g, 'Front:');
        responseText = responseText.replace(/\*{0,2}Back\*{0,2}:/g, 'Back:');
        
        // Clean up any extra whitespace or formatting
        responseText = responseText.trim();
        
        console.log('Cleaned response text:', responseText);
        
        // Split by pairs of newlines to get individual flashcard entries
        const flashcardEntries = responseText.split(/\n\s*\n/);
        console.log('Found flashcard entries:', flashcardEntries.length);
        
        // Parse each entry into a flashcard object
        const parsedFlashcards = flashcardEntries.map((entry, index) => {
          // Extract front text - more inclusive pattern to catch various formats
          const frontMatch = entry.match(/Front:\s*(.*?)(?=\s*\n\s*Back:|$)/s);
          // Extract back text - use end of string boundary or next pattern
          const backMatch = entry.match(/Back:\s*(.*?)(?=\s*\n\s*Front:|$)/s);
          
          if (frontMatch && backMatch) {
            return {
              front: frontMatch[1].trim(),
              back: backMatch[1].trim()
            };
          }
          console.log(`Failed to parse entry ${index}:`, entry);
          return null;
        }).filter(card => card !== null);
        console.log('Parsed flashcard objects:', parsedFlashcards);
        
        // Store flashcards in state
        setFlashcardArray(parsedFlashcards);
        
        // Create an exportable string representation
        const arrayString = `export const flashcards = ${JSON.stringify(parsedFlashcards, null, 2)};`;
        
        // Store the formatted response
        setResponse(`Successfully created ${parsedFlashcards.length} flashcards!`);
        
        //Create an empty deck
        if (!user) {
          throw new Error('User is not authenticated');
        }
        const data = (await createDeck(user.id, deckName))[0] as Deck;
        console.log('Data:', data)
        
        //Upload An array of cards - USE THE LOCAL VARIABLE, NOT THE STATE
        const CardsWithUID = parsedFlashcards.map(item => ({...item, owner_id: user.id}))
        console.log("CardsWithUID:", CardsWithUID);
        
        //Upload An array of cards
        const cards = (await sendData('FlashCard',CardsWithUID)) as FlashCard[];
        console.log("Cards:", cards)
        //We only want the ids for link
        const ArrayofCardID = (await cards).map(item => item.card_id);

        //Create the CardsToDeck object to prepare for upload
        const ConnectedCards = ArrayofCardID.map(card_id => ({
          card_id, 
          owner_id: user.id, 
          deck_id: data.deck_id
        }));
        
        //Upload the link!
        const connectCardsTodeck = sendData('CardsToDeck', ConnectedCards );
        console.log(connectCardsTodeck);
        
        console.log("Successfully created quiz")
        setResponse(result.responseText || 'Quiz created successfully!')

        // Add a short delay before redirecting to make sure the user sees the success message
        setTimeout(() => {
          // Navigate to the edit page for the newly created deck
          router.push(`/edit?deckId=${data.deck_id}`);
        }, 1500); // 1.5 second delay
        
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('Error during submission:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // using browser history
  const handleBackNavigation = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to router if no history is available
      setIsNavigating(true);
      router.push('/protected');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-karla">
      <Header user={user} />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button 
            className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-[var(--color-text-dark)] transition-colors cursor-pointer"
            onClick={handleBackNavigation}
          >
            <ArrowLeft size={20} className="text-[var(--color-primary)]" />
            <span className="font-medium">Back to Decks</span>
          </button>
        </div>
        
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-dark)] text-center mb-8">
          Create New Deck
        </h1>
        
        {/* Deck name input */}
        <div className="flex justify-center mb-8">
          <input 
            type="text" 
            placeholder="Enter Deck Name"
            value={deckName}
            onChange={handleDeckNameChange}
            className="w-full md:w-2/3 p-4 text-center bg-[var(--color-secondary)] rounded-xl border border-[var(--color-text-light)]/20 text-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </div>
          
        {/* Two column layout for file upload and text paste */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* File upload section */}
          <div className="flex-1">
            <div 
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="bg-[var(--color-unfilled)] h-64 border-2 border-dashed border-[var(--color-text-light)]/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)]/50 transition-all duration-300"
            >
              <input
                type="file"
                onChange={handleFileInput}
                accept=".txt,.pdf"
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-[var(--color-text-light)] mb-2" />
                  <span className="text-[var(--color-text)] font-medium">
                    Upload a File
                  </span>
                  {file && <span className="text-sm text-[var(--color-text-light)] mt-1">{file.name}</span>}
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-lg font-medium text-[var(--color-text)]">OR</span>
          </div>
          
          {/* Text input section */}
          <div className="flex-1">
            <textarea
              value={text}
              onChange={handleTextInput}
              className="w-full h-64 p-4 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-text-light)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none"
              placeholder="Paste text..."
            />
          </div>
        </div>
        
        {/* Detail level slider - replace with this enhanced version */}
        <div className="my-8">
          <div className="text-center text-[var(--color-primary)] font-medium mb-4">
            {detailLevel === 1 || (detailLevel < 1.5 && detailLevel >= 1) ? 'Low' : 
             detailLevel === 2 || (detailLevel < 2.5 && detailLevel >= 1.5) ? 'Medium' : 'High'} Detail
          </div>
          <div className="relative w-full max-w-full sm:max-w-xl mx-auto px-2">
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={detailLevel}
              onChange={handleDetailLevelChange}
              onMouseUp={() => {
                setDetailLevel(Math.round(detailLevel));
              }}
              onTouchEnd={() => {
                setDetailLevel(Math.round(detailLevel));
              }}
              className="w-full h-3 appearance-none cursor-pointer bg-[var(--color-card-medium)] rounded-lg 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)] 
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 
                        [&::-webkit-slider-thumb]:border-[var(--color-card-light)]
                        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-primary)]
                        [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-[var(--color-card-light)]"
            />
            <div className="flex justify-between mt-4">
              <div className={`transition-all duration-200 ease-in-out w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                Math.round(detailLevel) === 1 ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]' : 'bg-[var(--color-card-medium)] border-2 border-transparent'
              }`}>
                <span className={`text-xs font-bold ${
                  Math.round(detailLevel) === 1 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'
                }`}>1</span>
              </div>
              <div className={`transition-all duration-200 ease-in-out w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                Math.round(detailLevel) === 2 ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]' : 'bg-[var(--color-card-medium)] border-2 border-transparent'
              }`}>
                <span className={`text-xs font-bold ${
                  Math.round(detailLevel) === 2 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'
                }`}>2</span>
              </div>
              <div className={`transition-all duration-200 ease-in-out w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                Math.round(detailLevel) === 3 ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]' : 'bg-[var(--color-card-medium)] border-2 border-transparent'
              }`}>
                <span className={`text-xs font-bold ${
                  Math.round(detailLevel) === 3 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'
                }`}>3</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {response && (
          <div className="mb-4 text-green-600 text-sm text-center">
            {response}
          </div>
        )}
        
        {/* Generate button */}
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading || (!file && !text) || !deckName}
            className={`w-full py-4 rounded-xl text-white font-medium text-lg
              ${loading || (!file && !text) || !deckName
                ? 'bg-[var(--color-text-light)] cursor-not-allowed' 
                : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors duration-300'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Deck'
            )}
          </button>
        </div>
        
        {/* Create from scratch link */}
        <div className="text-center mt-4">
          <Link href="/edit" className="text-[var(--color-primary)] hover:underline">
            I want to create my own deck from scratch
          </Link>
        </div>
      </div>
    </div>
  )
}