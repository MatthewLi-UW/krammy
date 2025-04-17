'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";
import { FlashCard } from "@/types/FlashCard";
import { getADeck } from '@/utils/getData';

export default function EditDeckPage() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deckLoading, setDeckLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [deckName, setDeckName] = useState<string>("");
  const [editingDeckName, setEditingDeckName] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');

  // Auth check
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
        return;
      } else {
        const temp = data.user as User;
        setUser(temp ? { 
          id: temp.id, 
          email: temp.email,
          image: temp.user_metadata?.avatar_url || undefined
        } : null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch deck data
  useEffect(() => {
    const fetchDeckCards = async () => {
      if (!deckId) return;

      setDeckLoading(true);

      try {
        // Get the deck information first
        const { data: deckData, error: deckError } = await supabase
          .from('Deck')
          .select('deck_name, owner_id')  // Changed from user_id to owner_id
          .eq('deck_id', deckId)
          .single();

        if (deckError) throw deckError;
        
        // Check permissions
        if (user && deckData.owner_id !== user.id) {  // Changed from user_id to owner_id
          setToast({message: "You don't have permission to edit this deck", type: 'error'});
          router.push('/protected');
          return;
        }
        
        if (deckData) setDeckName(deckData.deck_name);
        
        // Fetch cards using a join query, similar to how the game loads cards
        const { data: joinData, error: joinError } = await supabase
          .from('CardsToDeck')
          .select(`
            card_id,
            FlashCard(*)
          `)
          .eq('deck_id', deckId);
        
        if (joinError) throw joinError;
        
        console.log("Join query result:", joinData);
        
        if (joinData && joinData.length > 0) {
          // Extract cards from the nested structure
          const cards = joinData.map(item => item.FlashCard);
          console.log("Extracted cards:", cards);
          setFlashcards(cards);
        } else {
          console.log("No cards found for this deck");
          setFlashcards([]);
        }
      } catch (error) {
        console.error("Error fetching deck cards:", error);
        setToast({message: "Failed to load deck data", type: 'error'});
      } finally {
        setDeckLoading(false);
      }
    };

    if (!loading && user) {
      fetchDeckCards();
    }
  }, [deckId, loading, user, router]);

  // Update deck name
  const updateDeckName = async () => {
    if (!deckId) return;
    
    try {
      const { error } = await supabase
        .from('Deck')
        .update({ deck_name: deckName })
        .eq('deck_id', deckId);
        
      if (error) throw error;
      setEditingDeckName(false);
      setToast({message: "Deck name updated successfully", type: 'success'});
    } catch (error) {
      console.error("Error updating deck name:", error);
      setToast({message: "Failed to update deck name", type: 'error'});
    }
  };

  // Update flashcard
  const updateCard = async (card: FlashCard) => {
    try {
      const { error } = await supabase
        .from('FlashCard')
        .update({
          front: card.front,
          back: card.back
        })
        .eq('card_id', card.card_id);
        
      if (error) throw error;
      
      setFlashcards(flashcards.map(c => 
        c.card_id === card.card_id ? card : c
      ));
      
      setToast({message: "Card updated successfully", type: 'success'});
    } catch (error) {
      console.error("Error updating card:", error);
      setToast({message: "Failed to update card", type: 'error'});
    }
  };

  // Delete flashcard
  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;
    
    try {
      // First remove from CardsToDeck
      const { error: linkError } = await supabase
        .from('CardsToDeck')
        .delete()
        .eq('card_id', cardId)
        .eq('deck_id', deckId);
        
      if (linkError) throw linkError;
      
      // Then delete the flashcard
      const { error } = await supabase
        .from('FlashCard')
        .delete()
        .eq('card_id', cardId);
        
      if (error) throw error;
      
      // Update local state
      setFlashcards(flashcards.filter(c => c.card_id !== Number(cardId)));
      setToast({message: "Card deleted successfully", type: 'success'});
    } catch (error) {
      console.error("Error deleting card:", error);
      setToast({message: "Failed to delete card", type: 'error'});
    }
  };

  // Add new flashcard
  const addNewCard = async () => {
    if (!deckId || !user) return;
    
    try {
      // Create new flashcard
      const { data: newCard, error } = await supabase
        .from('FlashCard')
        .insert({
          front: 'New term',
          back: 'New definition',
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Link to deck
      const { error: linkError } = await supabase
        .from('CardsToDeck')
        .insert({
          deck_id: deckId,
          card_id: newCard.card_id
        });
        
      if (linkError) throw linkError;
      
      // Update local state
      setFlashcards([...flashcards, newCard]);
      setToast({message: "New card added", type: 'success'});
    } catch (error) {
      console.error("Error adding new card:", error);
      setToast({message: "Failed to add new card", type: 'error'});
    }
  };

  // Card editor component
  const FlashcardEditor = ({ card }: { card: FlashCard }) => {
    const [editing, setEditing] = useState(false);
    const [front, setFront] = useState(card.front);
    const [back, setBack] = useState(card.back);

    const handleSave = () => {
      updateCard({
        ...card,
        front,
        back
      });
      setEditing(false);
    };

    return (
      <div key={card.card_id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {editing ? (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`term-${card.card_id}`}>
                Term
              </label>
              <textarea
                id={`term-${card.card_id}`}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`definition-${card.card_id}`}>
                Definition
              </label>
              <textarea
                id={`definition-${card.card_id}`}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/2 bg-gradient-to-r from-teal-50 to-white border-b md:border-b-0 md:border-r border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Term</h3>
              <p className="text-xl text-gray-800">{card.front}</p>
            </div>
            <div className="p-6 md:w-1/2">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Definition</h3>
              <p className="text-xl text-gray-800">{card.back}</p>
            </div>
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="p-1 bg-teal-100 text-teal-600 rounded hover:bg-teal-200 transition-colors"
                aria-label="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => deleteCard(card.card_id.toString())}
                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                aria-label="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading || deckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-beige-light">
      <Header user={user} />
      
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          {editingDeckName ? (
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="text-2xl font-bold rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 py-1 px-2"
                autoFocus
              />
              <button
                onClick={updateDeckName}
                className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingDeckName(false)}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-3xl font-bold text-gray-800 mr-3">
                {deckName}
              </h2>
              <button
                onClick={() => setEditingDeckName(true)}
                className="p-1 bg-teal-100 text-teal-600 rounded hover:bg-teal-200"
                aria-label="Edit Deck Name"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={addNewCard}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Card
            </button>
            <button
              onClick={() => router.push('/protected')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Decks
            </button>
          </div>
        </div>
        
        {/* Toast notification */}
        {toast && (
          <div className={`mb-4 p-3 rounded-md ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button onClick={() => setToast(null)} className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-6 relative">
          {flashcards.length > 0 ? (
            flashcards.map(card => (
              <FlashcardEditor key={card.card_id} card={card} />
            ))
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-md">
              <p className="text-xl text-gray-600 mb-4">No flashcards in this deck yet</p>
              <button
                onClick={addNewCard}
                className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Create your first flashcard
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}