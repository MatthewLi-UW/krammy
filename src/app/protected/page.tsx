'use client'

import { supabase } from "@/utils/supabase/client";
import { PlusIcon, SearchIcon, PenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

import { Deck } from "@/types/Deck";
import { cardsPerDeck, getData } from "@/utils/getData";

import ShareDeckForm from "./recievePage";
import RecieveDeckForm from "./sharePage";
import Header from "../components/header";
import Loading from '@/app/components/loading';

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [deckList, setDeckList] = useState<Deck[] | null>(null);
  const [deckCounts, setDeckCounts] = useState<{deck_id: number, count: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

  const filteredDecks = updatedDecks?.filter(deck => 
    deck.deck_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateNewDeck = () => {
    // Implement create new deck functionality
    router.push('/upload');
  };

  const handleDeckClick = (deckId: number) => {
    // Navigate to specific deck view
    router.push(`/game?deckId=${deckId}`);
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
    <div className="min-h-screen bg-beige-light font-karla">
      <Header user={user} />
      
      <div className="max-w-4xl mx-auto px-4 py-2 font-karla">
        {/* Enhanced Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="relative flex items-center">
            <SearchIcon 
              className="absolute left-3 text-teal-600/60 z-10" 
              size={18}
            />
            <input 
              type="text" 
              placeholder="Search for a deck" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-beige-medium border border-gray-300/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all duration-200 hover:shadow-md"
              aria-label="Search for a deck"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Deck Card with CSS-based animation */}
          <div 
            onClick={handleCreateNewDeck}
            className={`bg-gray-light bg-opacity-10 border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer ${
              hoveredIndex === -1
              ? 'scale-105 shadow-lg border-teal-500 border-opacity-50'
              : 'scale-100 shadow-sm border-gray-300 border-opacity-50'
            } transition-all duration-300 ease-in-out`}
            onMouseEnter={() => setHoveredIndex(-1)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={`${
              hoveredIndex === -1 ? 'scale-105' : 'scale-100'
            } transition-transform duration-300 ease-in-out`}>
              <PlusIcon className="text-gray-400 mb-2" size={40} />
            </div>
            <span className={`text-gray-400 text-lg ${
              hoveredIndex === -1 ? 'scale-105' : 'scale-100'
            } transition-transform duration-300 ease-in-out`}>
              Create New Deck
            </span>
          </div>

          {/* Deck Cards with CSS-based animation */}
          {filteredDecks.map((deck, index) => (
            <div 
              key={deck.deck_id} 
              onClick={() => handleDeckClick(deck.deck_id)}
              className={`bg-beige-medium rounded-xl border h-48 p-5 flex flex-col justify-center items-center cursor-pointer relative ${
                hoveredIndex === index
                ? 'scale-105 shadow-lg border-teal-600'
                : 'scale-100 shadow-sm border-transparent'
              } transition-all duration-300 ease-in-out`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={`/edit?deckId=${deck.deck_id}`}>
                <div 
                  className="absolute top-4 right-4 text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the click from bubbling up to the parent div
                  }}
                >
                  <PenIcon size={18} className="text-[#D0C8B0] hover:text-teal-600 transition-colors" />
                </div>
              </Link>
              <div className="text-center">
                <h3 className={`font-bold text-xl text-gray-800 ${
                  hoveredIndex === index ? 'scale-101' : 'scale-100'
                } transition-transform duration-300 ease-in-out`}>
                  {deck.deck_name}
                </h3>
                <p className={`text-teal-600 font-medium mt-1 ${
                  hoveredIndex === index ? 'scale-101' : 'scale-100'
                } transition-transform duration-300 ease-in-out`}>
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
      {/* Sharing Section with improved UI */}
      <div className="max-w-4xl mx-auto px-4 pb-16 font-karla">
        <div className="mt-16 bg-beige-medium/50 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Share & Receive Decks</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Share Deck Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-teal-500/10 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Share Your Deck</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Share your flashcard decks with friends or colleagues
              </p>
              <ShareDeckForm uuid={user?.id ?? ""} />
            </div>
            
            {/* Receive Deck Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-teal-500/10 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 16 12 20 8 16"></polyline>
                    <line x1="12" y1="2" x2="12" y2="20"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Receive a Deck</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Access shared decks using a provided share code
              </p>
              <RecieveDeckForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}