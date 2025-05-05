'use client'

import { supabase } from "@/utils/supabase/client";
import { PlusIcon, SearchIcon, PenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

import { Deck } from "@/types/Deck";
import { cardsPerDeck, getData } from "@/utils/getData";

import Header from "../components/header";
import Loading from '@/app/components/loading';
import ShareModal from "@/app/protected/shareModal";
import ImportModal from "@/app/protected/importModal";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [deckList, setDeckList] = useState<Deck[] | null>(null);
  const [deckCounts, setDeckCounts] = useState<{deck_id: number, count: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [selectedDeckName, setSelectedDeckName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
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
        setLoading(false);
      }
    }

    const deckListGet = async () => {
      const decks = await getData("Deck") as Deck[];
      const deckIds = decks?.map(deck => 
        deck.deck_id) || [];
      const deckCounts = await cardsPerDeck(deckIds);
      setDeckCounts(deckCounts);
      decks?.forEach(deck => {
        const match = deckCounts.find((extra: { deck_id: number, count: number }) => extra.deck_id === deck.deck_id);
        deck.card_count = match ? match.count : 0; 
      });
      setDeckList(decks);
    }

    fetchUser();
    deckListGet();
  }, [router]);

  const updatedDecks = deckList?.map(deck => {
    const match = deckCounts.find(extra => extra.deck_id === deck.deck_id);
    return {
      ...deck,
      count: match ? match.count : 0
    };
  }) || [];

  const filteredDecks = updatedDecks
    ?.filter(deck => deck.deck_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Sort by created_at in descending order (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) || [];

  const handleCreateNewDeck = () => {
    // Implement create new deck functionality
    router.push('/upload');
  };

  const handleDeckClick = (deckId: number) => {
    // Navigate to specific deck view
    router.push(`/game?deckId=${deckId}`);
  };

  const handleShareDeck = (deckId: number) => {
    const deck = filteredDecks.find(d => d.deck_id === deckId);
    setSelectedDeckId(deckId);
    setSelectedDeckName(deck?.deck_name || '');
    setShareModalOpen(true);
  };

  const handleImportSuccess = () => {
    
    
    // Fetch the updated deck list
    const deckListGet = async () => {
      try {
        const decks = await getData("Deck") as Deck[];
        const deckIds = decks?.map(deck => deck.deck_id) || [];
        const deckCounts = await cardsPerDeck(deckIds);
        setDeckCounts(deckCounts);
        
        // Update card counts for each deck
        decks?.forEach(deck => {
          const match = deckCounts.find((extra: { deck_id: number, count: number }) => 
            extra.deck_id === deck.deck_id
          );
          deck.card_count = match ? match.count : 0; 
        });
        
        setDeckList(decks);
      } catch (error) {
        console.error("Error refreshing deck list:", error);
      }
    };
    
    // Call the function to refresh decks
    deckListGet();
  };

  if (loading) {
    return <Loading />;
  }

  // Safely calculate the number of empty placeholders
  const calculatePlaceholders = () => {
    const totalItems = filteredDecks.length + 1; // +1 for the "Create New Deck" card
    const mod = totalItems % 3;
    if (mod === 0) return 0;
    return 3 - mod;
  };

  const placeholdersCount = calculatePlaceholders();

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-karla">
      <Header user={user} />
      
      <div className="max-w-4xl mx-auto px-4 py-2 font-karla">
        <div className="relative max-w-md mx-auto mb-8 flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <SearchIcon 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]/60 z-10" 
              size={18} 
            />
            <input
              type="text"
              placeholder="Search for a deck"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-[var(--color-secondary)] border border-[var(--color-text-light)]/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/50 transition-all duration-200 hover:shadow-md"
              aria-label="Search for a deck"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </div>
          
          {/* New Import button next to search bar */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex-shrink-0 py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 16 12 20 8 16" />
              <line x1="12" y1="2" x2="12" y2="20" />
            </svg>
            <span>Import Deck</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Deck Card with CSS-based animation */}
          <div 
            onClick={handleCreateNewDeck}
            className={`bg-[var(--color-unfilled)] border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer ${
              hoveredIndex === -1
              ? 'scale-105 shadow-lg border-[var(--color-primary)] border-opacity-50'
              : 'scale-100 shadow-sm border-[var(--color-text-light)] border-opacity-50'
            } transition-all duration-300 ease-in-out`}
            onMouseEnter={() => setHoveredIndex(-1)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={`${
              hoveredIndex === -1 ? 'scale-105' : 'scale-100'
            } transition-transform duration-300 ease-in-out`}>
              <PlusIcon className="text-[var(--color-text-light)] mb-2" size={40} />
            </div>
            <span className={`text-[var(--color-text-light)] text-lg ${
              hoveredIndex === -1 ? 'scale-105' : 'scale-100'
            } transition-transform duration-300 ease-in-out`}>
              Create New Deck
            </span>
          </div>

          {/* Deck Cards with CSS-based animation */}
          {filteredDecks.map((deck, index) => (
            <div 
              key={deck.deck_id} 
              className={`bg-[var(--color-secondary)] rounded-xl border h-48 p-5 flex flex-col justify-center items-center cursor-pointer relative ${
                hoveredIndex === index
                ? 'scale-105 shadow-lg border-[var(--color-primary)]'
                : 'scale-100 shadow-sm border-transparent'
              } transition-all duration-300 ease-in-out`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleDeckClick(deck.deck_id)}
            >
              {/* Share button - moved to top-left */}
              <div className="absolute top-4 left-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareDeck(deck.deck_id);
                  }}
                  className="p-1.5 rounded-full text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors"
                  aria-label="Share Deck"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
              </div>
              
              {/* Edit link - remains in top-right */}
              <div className="absolute top-4 right-4">
                <Link 
                  href={`/edit?deckId=${deck.deck_id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1.5 rounded-full hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors">
                    <PenIcon size={16} />
                  </div>
                </Link>
              </div>
              
              {/* Deck content remains the same */}
              <div className="text-center">
                <h3 className="font-bold text-xl text-[var(--color-text-dark)]">
                  {deck.deck_name}
                </h3>
                <p className="text-[var(--color-primary)] font-medium mt-1">
                  {deck.card_count || 0} Terms
                </p>
              </div>
            </div>
          ))}

          {/* Empty placeholder cards to maintain grid layout */}
          {placeholdersCount > 0 && Array.from({ length: placeholdersCount }).map((_, index) => (
            <div key={`empty-${index}`} className="h-48 rounded-lg bg-transparent"></div>
          ))}
        </div>
      </div>



      {/* Share Modal */}
      <ShareModal
        deckId={selectedDeckId}
        deckName={selectedDeckName}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Import Modal */}
      <ImportModal
        userId={user?.id || ''}
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}