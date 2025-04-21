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

export default function UploadPage() {
  // Add an authentication loading state
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const [detailLevel, setDetailLevel] = useState(2) // For the slider (1-3 range)
  const [deckName, setDeckName] = useState('')
  const [flashcardArray, setFlashcardArray] = useState<{front: string, back: string}[]>([])
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const fetchUser = async () => {
    setIsAuthLoading(true); // Set loading to true when starting auth check
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/sign-in");
    } else {
      const user = data.user as User;
      setUser(user ? { id: user.id, email: user.email } : null);
    }
    setIsAuthLoading(false); // Auth check complete
  }

  // Call fetchUser on page load
  useEffect(() => {
    fetchUser();
  }, []);

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
    <Loading />
    )
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
    setDetailLevel(parseInt(e.target.value))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResponse('')

    try {
      let content = text

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) throw new Error('Upload failed')
        
        const uploadResult = await uploadResponse.json()
        console.log('File upload response:', uploadResult)
        content = uploadResult.text
      }

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
        const data = (await createDeck(user.id, deckName))[0] as Deck;
        console.log('Data:', data)
        
        //Upload An array of cards - USE THE LOCAL VARIABLE, NOT THE STATE
        const CardsWithUID = parsedFlashcards.map(item => ({...item, owner_id: user.id}))
        console.log("CardsWithUID:", CardsWithUID);
        
        //Upload An array of cards
        // const CardsWithUID = flashcardArray.map(item => ({...item, owner_id: user.id}) )
        // console.log("CardsWithUID:", CardsWithUID)
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
    <div className="min-h-screen bg-beige-light font-karla">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button and user icon */}
        <div className="flex justify-between items-center mb-8">
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            onClick={handleBackNavigation}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Deck name input */}
        <div className="flex justify-center mb-8">
          <input 
            type="text" 
            placeholder="Deck Name"
            value={deckName}
            onChange={handleDeckNameChange}
            className="w-1/2 p-4 text-center bg-beige-medium rounded-md border-none text-xl focus:outline-none"
          />
        </div>
          
        {/* Two column layout for file upload and text paste */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* File upload section */}
          <div className="flex-1">
            <div 
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="bg-gray-dark bg-opacity-5 h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-all duration-300"
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
                  <svg 
                    className="w-10 h-10 text-gray-400 mb-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-gray-500 font-medium">
                    Upload a File
                  </span>
                  {file && <span className="text-sm text-gray-400 mt-1">{file.name}</span>}
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-lg font-medium">OR</span>
          </div>
          
          {/* Text input section */}
          <div className="flex-1">
            <textarea
              value={text}
              onChange={handleTextInput}
              className="w-full h-64 p-4 rounded-lg bg-beige-medium border-none focus:outline-none resize-none"
              placeholder="Paste text..."
            />
          </div>
        </div>
        
        {/* Detail level slider */}
        <div className="my-8">
          <div className="text-center text-[#2AA296] font-medium mb-4">
            {detailLevel === 1 ? 'Low' : detailLevel === 2 ? 'Medium' : 'High'} Detail
          </div>
          <div className="relative w-full">
            <input
              type="range"
              min="1"
              max="3"
              value={detailLevel}
              onChange={handleDetailLevelChange}
              className="w-full h-2 bg-[#2AA296] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <div className={`w-4 h-4 ${detailLevel === 1 ? 'bg-[#2AA296]' : 'bg-[#E0E0E0]'} rounded-full`}></div>
              <div className={`w-4 h-4 ${detailLevel === 2 ? 'bg-[#2AA296]' : 'bg-[#E0E0E0]'} rounded-full`}></div>
              <div className={`w-4 h-4 ${detailLevel === 3 ? 'bg-[#2AA296]' : 'bg-[#E0E0E0]'} rounded-full`}></div>
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
        <button
          onClick={handleSubmit}
          disabled={loading || (!file && !text)}
          className={`w-full py-4 rounded-lg text-white font-medium text-lg
            ${loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-[#2AA296] hover:bg-[#249185] transition-colors duration-300'
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
        
        
        {/* Create from scratch link */}
        <div className="text-center mt-4">
          <a href="#" className="text-[#2AA296] hover:underline">
            I want to create my own deck from scratch
          </a>
        </div>
      </div>
    </div>
  )
}