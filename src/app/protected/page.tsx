'use client'

import { supabase } from "@/utils/supabase/client";
import { PlusIcon, SearchIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/User";
import { Deck } from "@/types/Deck";
import { getData } from "@/utils/getData";
import { signOutAction } from "../actions";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [deckList, setDeckList] = useState<Deck[] | null>(null);
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
      setDeckList(decks);
    }
  
    deckListGet();
    fetchUser();
  }, [router]);

  const filteredDecks = deckList?.filter(deck => 
    deck.deck_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateNewDeck = () => {
    // Implement create new deck functionality
    router.push('/create-deck');
  };

  const handleDeckClick = (deckId: number) => {
    // Navigate to specific deck view
    router.push(`/deck/${deckId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Search and User */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative flex-grow max-w-md mr-4">
          <input 
            type="text" 
            placeholder="Search for a deck" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B65F3C]"
          />
          <SearchIcon 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        </div>
        <div 
          onClick={signOutAction} 
          className="cursor-pointer hover:bg-gray-100 rounded-full p-2"
        >
          <UserIcon size={24} />
        </div>
      </div>

      {/* Create New Deck Button */}
      <div 
        onClick={handleCreateNewDeck}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
      >
        <PlusIcon className="mr-2 text-gray-500" />
        <span className="text-gray-500">Create New Deck</span>
      </div>

      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecks.map((deck) => (
          <div 
            key={deck.deck_id} 
            onClick={() => handleDeckClick(deck.deck_id)}
            className="bg-[#F5F5F5] rounded-lg p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition"
          >
            <div>
              <h3 className="font-semibold text-lg">{deck.deck_name}</h3>
              <p className="text-sm text-gray-500">{deck.card_count || 0} Terms</p>
            </div>
            <div className="text-gray-400 hover:text-gray-600">
              <PlusIcon size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}