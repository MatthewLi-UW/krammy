'use client'

import { supabase } from "@/utils/supabase/client";
import { PlusIcon, SearchIcon, UserIcon, PenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import Link from "next/link";

import { Deck } from "@/types/Deck";
import { cardsPerDeck, getData } from "@/utils/getData";
import { signOutAction } from "../actions";

import ShareDeckForm from "./recievePage";
import RecieveDeckForm from "./sharePage";
import KrammyLogo from "../components/logo"


export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [deckList, setDeckList] = useState<Deck[] | null>(null);
  const [deckCounts, setDeckCounts] = useState<{deck_id: number, count: number}[]> ([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
      } else {
        const temp = data.user as User;
        setUser(temp ? { id: temp.id, email: temp.email } : null);
        setLoading(false);
      }
    }

    const deckListGet = async () => {
      const decks = await getData("Deck") as Deck[];
      const deckIds = decks?.map(deck => 
        deck.deck_id) || [];
        console.log(deckIds + "DECKIDs")
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
    router.push(`/deck/${deckId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
      {/* Header with Logo and User in opposite corners */}
      <div className="flex justify-between items-center p-6">
        <Link legacyBehavior href="/">
          <a className="flex items-center gap-3">
            <KrammyLogo width={40} height={40} />
            <span className="text-2xl font-bold text-gray-800">Krammy</span>
          </a>
        </Link>
        
        <div className="cursor-pointer hover:bg-gray-100 rounded-full p-2">
          <UserIcon onClick={signOutAction} size={24} />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-2 font-karla">
        {/* Centered Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <input 
            type="text" 
            placeholder="Search for a deck" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-black border-opacity-25 w-full px-4 py-2 pl-10 bg-beige-medium border rounded-md focus:outline-none"
          />
          <SearchIcon 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        </div>

        {/* Deck Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Deck Card */}
          <div 
            onClick={handleCreateNewDeck}
            className="bg-gray-light bg-opacity-10 border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
          >
            <PlusIcon className="text-gray-400 mb-2" size={40} />
            <span className="text-gray-400 text-lg">Create New Deck</span>
          </div>

          {/* Deck Cards */}
          {filteredDecks.map((deck) => (
            <div 
              key={deck.deck_id} 
              onClick={() => handleDeckClick(deck.deck_id)}
              className="bg-beige-medium rounded-xl h-48 p-5 flex flex-col justify-center items-center cursor-pointer shadow-sm hover:shadow-md transition relative"
              style={{ 
                boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div className="absolute top-4 right-4 text-gray-400">
                <PenIcon size={18} className="text-[#D0C8B0]" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-800">{deck.deck_name}</h3>
                <p className="text-teal-600 font-medium mt-1">{deck.card_count || 0} Terms</p>
              </div>
            </div>
          ))}

          {/* Empty placeholder cards to maintain grid layout */}
          {placeholdersCount > 0 && Array.from({ length: placeholdersCount }).map((_, index) => (
            <div key={`empty-${index}`} className="h-48 rounded-lg bg-transparent"></div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <RecieveDeckForm />
        <ShareDeckForm uuid={user?.id ??  ""} />
      </div>
    </div>
  );
}