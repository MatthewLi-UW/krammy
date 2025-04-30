'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDeck, sendData } from '@/utils/sendData'
import { User } from "@/types/user";
import { Deck } from "@/types/Deck";
import { FlashCard } from "@/types/FlashCard";
import { supabase } from "@/utils/supabase/client";
import Loading from '@/app/components/loading';
import Header from '@/app/components/header';
import { ArrowLeft, Upload, FileText, Info, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UploadPage() {
  // State declarations
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const [detailLevel, setDetailLevel] = useState(1)
  const [deckName, setDeckName] = useState('')
  const [flashcardArray, setFlashcardArray] = useState<{front: string, back: string}[]>([])
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch user data
  const fetchUser = async () => {
    setIsAuthLoading(true);
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
    setIsAuthLoading(false);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  if (isAuthLoading) {
    return <Loading />
  }

  // Event handlers
  const handleFileDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'text/plain' || droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
      setActiveTab('file')
    } else {
      setError('Please upload a .txt or .pdf file')
    }
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setActiveTab('file')
    }
  }

  const handleTextInput = (e) => {
    setText(e.target.value)
    if (e.target.value.trim()) {
      setActiveTab('text')
    }
  }
  
  const handleDeckNameChange = (e) => {
    setDeckName(e.target.value)
  }
  
  const handleDetailLevelChange = (e) => {
    const value = parseFloat(e.target.value);
    if (Math.abs(value - Math.round(value)) < 0.15) {
      setDetailLevel(Math.round(value));
    } else {
      setDetailLevel(value);
    }
  }

  const clearFile = () => {
    setFile(null);
    if (text) {
      setActiveTab('text');
    }
  }

  const clearText = () => {
    setText('');
    if (file) {
      setActiveTab('file');
    }
  }

  const handleSubmit = async () => {
    if (!deckName.trim()) {
      setError('Please enter a deck name');
      return;
    }
    
    if (!file && !text.trim()) {
      setError('Please upload a file or enter text');
      return;
    }
    
    setLoading(true)
    setError('')
    setResponse('')

    try {
      let content = text

      if (file) {
        // Different handling based on file type
        if (file.type === 'application/pdf') {
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

      const aiResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, deckName, detailLevel })
      })

      if (!aiResponse.ok) throw new Error('Processing failed')

      const result = await aiResponse.json()
      
      if (result.success && result.responseText) {
        let responseText = result.responseText.replace(/^\*\*Flashcards:\*\*\s*\n+/i, '');
        responseText = responseText.replace(/\*{0,2}Front\*{0,2}:/g, 'Front:');
        responseText = responseText.replace(/\*{0,2}Back\*{0,2}:/g, 'Back:');
        responseText = responseText.trim();
        
        const flashcardEntries = responseText.split(/\n\s*\n/);
        
        const parsedFlashcards = flashcardEntries.map((entry, index) => {
          const frontMatch = entry.match(/Front:\s*(.*?)(?=\s*\n\s*Back:|$)/s);
          const backMatch = entry.match(/Back:\s*(.*?)(?=\s*\n\s*Front:|$)/s);
          
          if (frontMatch && backMatch) {
            return {
              front: frontMatch[1].trim(),
              back: backMatch[1].trim()
            };
          }
          return null;
        }).filter(card => card !== null);
        
        setFlashcardArray(parsedFlashcards);
        setResponse(`Successfully created ${parsedFlashcards.length} flashcards!`);
        
        if (!user) {
          throw new Error('User is not authenticated');
        }
        const data = (await createDeck(user.id, deckName))[0] as Deck;
        
        const CardsWithUID = parsedFlashcards.map(item => ({...item, owner_id: user.id}))
        const cards = (await sendData('FlashCard',CardsWithUID)) as FlashCard[];
        const ArrayofCardID = (await cards).map(item => item.card_id);

        const ConnectedCards = ArrayofCardID.map(card_id => ({
          card_id, 
          owner_id: user.id, 
          deck_id: data.deck_id
        }));
        
        await sendData('CardsToDeck', ConnectedCards);

        setTimeout(() => {
          router.push(`/edit?deckId=${data.deck_id}`);
        }, 1500);
        
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

  const handleCreateFromScratch = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      const data = (await createDeck(user.id, "Untitled Deck"))[0] as Deck;
      router.push(`/edit?deckId=${data.deck_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create empty deck');
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setIsNavigating(true);
      router.push('/protected');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-karla">
      <Header user={user} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <button 
          onClick={handleBackNavigation}
          className="group flex items-center text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors mb-8"
        >
          <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
          <span>Back to Decks</span>
        </button>
        
        {/* Card container */}
        <div className="bg-[var(--color-secondary)] rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-dark)] mb-6">Create New Deck</h1>
          
          {/* Deck name input */}
          <div className="mb-6">
            <label htmlFor="deckName" className="block text-[var(--color-text)] mb-2 font-medium">
              Deck Name
            </label>
            <input 
              id="deckName"
              type="text" 
              placeholder="Enter a name for your deck"
              value={deckName}
              onChange={handleDeckNameChange}
              className="w-full p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-card-medium)] text-[var(--color-text-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>
          
          {/* Content tabs */}
          <div className="mb-6">
            <label className="block text-[var(--color-text)] mb-2 font-medium">Content Source</label>
            <div className="flex border-b border-[var(--color-card-medium)]">
              <button 
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  activeTab === 'file' 
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                    : 'text-[var(--color-text-light)] hover:text-[var(--color-text)]'
                }`}
              >
                <Upload size={18} className="inline-block mr-2" />
                Upload File
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  activeTab === 'text' 
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' 
                    : 'text-[var(--color-text-light)] hover:text-[var(--color-text)]'
                }`}
              >
                <FileText size={18} className="inline-block mr-2" />
                Enter Text
              </button>
            </div>
            
            {/* File upload panel */}
            <div className={`mt-4 ${activeTab === 'file' ? 'block' : 'hidden'}`}>
              <div 
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative rounded-lg p-8 text-center transition-colors ${
                  file 
                    ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/50' 
                    : 'bg-[var(--color-unfilled)] border-[var(--color-text-light)]/30 hover:border-[var(--color-primary)]/40'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".txt,.pdf"
                  className="hidden"
                  id="fileInput"
                />
                
                {file ? (
                  <div className="py-4">
                    <div className="flex items-center justify-center mb-3">
                      <FileText className="h-8 w-8 text-[var(--color-primary)]" />
                    </div>
                    <p className="text-[var(--color-text-dark)] font-medium mb-1">{file.name}</p>
                    <p className="text-[var(--color-text-light)] text-sm mb-4">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button 
                      onClick={clearFile}
                      className="inline-flex items-center text-sm text-[var(--color-text)] hover:text-[var(--color-error-text)] transition-colors"
                    >
                      <X size={16} className="mr-1" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="fileInput" className="cursor-pointer block py-8">
                    <div className="flex items-center justify-center mb-3">
                      <Upload className="h-8 w-8 text-[var(--color-text-light)]" />
                    </div>
                    <p className="text-[var(--color-text)] font-medium mb-1">
                      Drag & drop a file or click to browse
                    </p>
                    <p className="text-[var(--color-text-light)] text-sm">
                      Support for .txt and .pdf files
                    </p>
                  </label>
                )}
              </div>
            </div>
            
            {/* Text input panel */}
            <div className={`mt-4 ${activeTab === 'text' ? 'block' : 'hidden'}`}>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={handleTextInput}
                  className="w-full h-48 p-4 rounded-lg bg-[var(--color-unfilled)]  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none"
                  placeholder="Paste your text content here..."
                ></textarea>
                {text && (
                  <button 
                    onClick={clearText}
                    className="absolute top-3 right-3 text-[var(--color-text-light)] hover:text-[var(--color-error-text)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Detail level selector */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[var(--color-text)] font-medium">
                Detail Level
              </label>
              <div className="text-[var(--color-primary)] font-medium text-sm">
                {detailLevel === 1 || (detailLevel < 1.5 && detailLevel >= 1) ? 'Low' : 
                 detailLevel === 2 || (detailLevel < 2.5 && detailLevel >= 1.5) ? 'Medium' : 'High'}
              </div>
            </div>
            
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={detailLevel}
              onChange={handleDetailLevelChange}
              onMouseUp={() => setDetailLevel(Math.round(detailLevel))}
              onTouchEnd={() => setDetailLevel(Math.round(detailLevel))}
              className="w-full h-2 appearance-none cursor-pointer bg-[var(--color-card-medium)] rounded-lg 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)] 
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 
                        [&::-webkit-slider-thumb]:border-[var(--color-card-light)]
                        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-primary)]
                        [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-[var(--color-card-light)]"
            />
            
            <div className="flex justify-between mt-2">
              <div className="text-xs font-medium text-[var(--color-text-light)]">Less cards, broader topics</div>
              <div className="text-xs font-medium text-[var(--color-text-light)]">More cards, detailed content</div>
            </div>
          </div>
          
          {/* Info tips */}
          <div className="bg-[var(--color-primary)]/10 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info size={18} className="text-[var(--color-primary)] mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-[var(--color-text)]">
                <p className="mb-1"><strong>What happens next?</strong></p>
                <p>Your content will be analyzed to create flashcards based on the detail level you've selected. Higher detail means more specific cards, while lower detail creates broader concept cards.</p>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="flex items-center bg-[var(--color-error-text)]/10 text-[var(--color-error-text)] p-3 rounded-lg mb-6">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Success message */}
          {response && (
            <div className="flex items-center bg-success-light text-success-dark p-3 rounded-lg mb-6">
              <CheckCircle2 size={16} className="text-success mr-2 flex-shrink-0" />
              <p className="text-sm">{response}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleSubmit}
              disabled={loading || (!file && !text.trim()) || !deckName.trim()}
              className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center
                ${loading || (!file && !text.trim()) || !deckName.trim()
                  ? 'bg-[var(--color-text-light)] cursor-not-allowed' 
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing...
                </>
              ) : (
                'Generate Flashcards'
              )}
            </button>
            
            <button 
              onClick={handleCreateFromScratch}
              disabled={loading}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] bg-transparent py-2 transition-colors"
            >
              Or create an empty deck and add cards manually
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
