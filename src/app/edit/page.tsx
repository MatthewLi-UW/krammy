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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [showDeleteDeckModal, setShowDeleteDeckModal] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        // Start fade out animation before removal
        const toastElement = document.getElementById('toast-notification');
        if (toastElement) {
          toastElement.classList.add('animate-fadeOut');
          // Wait for animation to complete before removing
          setTimeout(() => setToast(null), 300);
        } else {
          setToast(null);
        }
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
          .select('deck_name, owner_id')
          .eq('deck_id', deckId)
          .single();

        if (deckError) throw deckError;
        
        // Check permissions
        if (!user) {
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
          const cards = joinData.map(item => item.FlashCard).flat();
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
    setCardToDelete(cardId);
    setShowDeleteModal(true);
  };

  // Confirm delete flashcard
  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    
    try {
      // First remove from CardsToDeck
      const { error: linkError } = await supabase
        .from('CardsToDeck')
        .delete()
        .eq('card_id', cardToDelete)
        .eq('deck_id', deckId);
        
      if (linkError) throw linkError;
      
      // Then delete the flashcard
      const { error } = await supabase
        .from('FlashCard')
        .delete()
        .eq('card_id', cardToDelete);
        
      if (error) throw error;
      
      // Update local state
      setFlashcards(flashcards.filter(c => c.card_id !== Number(cardToDelete)));
      setToast({message: "Card deleted successfully", type: 'success'});
    } catch (error) {
      console.error("Error deleting card:", error);
      setToast({message: "Failed to delete card", type: 'error'});
    } finally {
      // Close the modal
      setShowDeleteModal(false);
      setCardToDelete(null);
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
          owner_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Link to deck
      const { error: linkError } = await supabase
        .from('CardsToDeck')
        .insert({
          deck_id: deckId,
          card_id: newCard.card_id,
          owner_id: user.id
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

  // Delete deck
  const deleteDeck = async () => {
    if (!deckId) return;
    
    try {
      // Convert deckId to a number for database operations
      const numericDeckId = parseInt(deckId, 10);
      
      console.log("Attempting to delete deck ID:", numericDeckId);

      const { error: cardLinkError } = await supabase
        .from('CardsToDeck')
        .delete()
        .eq('deck_id', numericDeckId);
        
      if (cardLinkError) {
        console.error("Error deleting CardsToDeck:", cardLinkError);
        throw cardLinkError;
      }
      
      const { error: userToDeckError } = await supabase
        .from('UserToDeck')
        .delete()
        .eq('deck_id', numericDeckId);
        
      if (userToDeckError) {
        console.error("Error deleting UserToDeck:", userToDeckError);
        throw userToDeckError;
      }
      
      const { error: sharedDecksError } = await supabase
        .from('SharedDecks')
        .delete()
        .eq('deck_id', numericDeckId);
        
      if (sharedDecksError && !sharedDecksError.message.includes('does not exist')) {
        console.error("Error deleting SharedDecks:", sharedDecksError);
        throw sharedDecksError;
      }
      
      const { data: deckData, error: fetchError } = await supabase
        .from('Deck')
        .select('*')
        .eq('deck_id', numericDeckId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching deck before deletion:", fetchError);
        throw fetchError;
      }
      
      console.log("Found deck to delete:", deckData);
      
      const { error } = await supabase
        .from('Deck')
        .delete()
        .eq('deck_id', numericDeckId);
        
      if (error) {
        console.error("Error deleting Deck:", error);
        throw error;
      }
      
      setTimeout(() => {
        router.push('/protected');
      }, 500);
    } catch (error) {
      console.error("Error deleting deck:", error);
      setToast({message: "Failed to delete deck", type: 'error'});
      // Show the detailed error message
      if (error instanceof Error && error.message) {
        console.error("Error message:", error.message);
      }
      if (error instanceof Error && 'details' in error) {
        console.error("Error details:", error.details);
      }
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
      <div className="bg-[var(--color-card-light)] rounded-xl shadow-md overflow-hidden border border-[var(--color-card-medium)]/50 relative hover:shadow-lg transition-shadow duration-300">
        {editing ? (
          <div className="p-6">
            <div className="mb-5">
              <label className="block text-[var(--color-text-dark)] font-medium mb-2" htmlFor={`term-${card.card_id}`}>
                Term
              </label>
              <textarea
                id={`term-${card.card_id}`}
                className="w-full bg-[var(--color-background-light)] p-3 border border-[var(--color-card-medium)]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                placeholder="Enter term..."
              />
            </div>
            <div className="mb-5">
              <label className="block text-[var(--color-text-dark)] font-medium mb-2" htmlFor={`definition-${card.card_id}`}>
                Definition
              </label>
              <textarea
                id={`definition-${card.card_id}`}
                className="w-full bg-[var(--color-background-light)] p-3 border border-[var(--color-card-medium)]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                placeholder="Enter definition..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-background-light)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/2 bg-[var(--color-secondary)]/20 border-b md:border-b-0 md:border-r border-[var(--color-card-medium)]/30 relative">
              <h3 className="text-md font-medium text-[var(--color-text-light)] mb-2">Term</h3>
              <p className="text-lg text-[var(--color-text-dark)]">{card.front}</p>
            </div>
            <div className="p-6 md:w-1/2 relative">
              <h3 className="text-md font-medium text-[var(--color-text-light)] mb-2">Definition</h3>
              <p className="text-lg text-[var(--color-text-dark)]">{card.back}</p>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
                aria-label="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => deleteCard(card.card_id.toString())}
                className="p-2 text-[var(--color-error-text)] bg-[var(--color-error-text)]/10 rounded-lg hover:bg-[var(--color-error-text)]/20 transition-colors"
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
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <Header user={user} />
      
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Floating toast notification */}
        {toast && (
          <div 
            id="toast-notification"
            className="fixed bottom-20 left-0 right-0 flex justify-center items-center px-4 z-50 pointer-events-none"
          >
            <div 
              className={`max-w-md w-full py-3 px-4 rounded-lg shadow-lg pointer-events-auto
                ${toast.type === 'success' 
                  ? 'bg-success text-white' 
                  : 'bg-[var(--color-error-text)] text-white'
                } flex items-center justify-between
                animate-slideUpFade
              `}
            >
              <div className="flex items-center">
                {toast.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <p>{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="ml-3 text-white hover:text-white/80 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Simplified header section with just deck name */}
        <div className="bg-[var(--color-card-light)] p-5 rounded-xl shadow-sm mb-8">
          {editingDeckName ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="text-2xl bg-[var(--color-background-light)] font-semibold rounded-lg border border-[var(--color-card-medium)]/50 shadow-sm focus:border-[var(--color-primary)] focus:ring focus:ring-[var(--color-primary)]/30 focus:ring-opacity-50 py-2 px-3 w-full"
                autoFocus
                placeholder="Deck name"
              />
              <div className="flex gap-2">
                <button
                  onClick={updateDeckName}
                  className="p-2 bg-[var(--color-primary)] text-[var(--color-background-light)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setEditingDeckName(false)}
                  className="p-2 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-dark)]">
                {deckName}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingDeckName(true)}
                  className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
                  aria-label="Edit Deck Name"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteDeckModal(true)}
                  className="p-2 bg-[var(--color-error-text)]/10 text-[var(--color-error-text)] rounded-lg hover:bg-[var(--color-error-text)]/20 transition-colors"
                  aria-label="Delete Deck"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Card count display */}
          <p className="text-[var(--color-text-light)] mt-2">
            {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'} in this deck
          </p>
        </div>
        
        {/* Flashcards grid with staggered animation */}
        <div className="space-y-5">
          {flashcards.length > 0 ? (
            flashcards.map((card, index) => (
              <div 
                key={card.card_id} 
                className="opacity-0" 
                style={{
                  animation: 'scaleIn 0.4s ease-out forwards',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <FlashcardEditor card={card} />
              </div>
            ))
          ) : (
            <div className="text-center p-12 bg-[var(--color-card-light)] rounded-xl shadow-sm border border-dashed border-[var(--color-card-medium)]/50 animate-scaleIn">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--color-primary)] animate-breathe" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <p className="text-xl text-[var(--color-text)] mb-5">No flashcards in this deck yet</p>
              <button
                onClick={addNewCard}
                className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-background-light)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
              >
                Create your first flashcard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed action bar with animated buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-background-light)] shadow-lg border-t border-[var(--color-card-medium)]/30 py-3 px-4 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left side - Back button */}
          <button
            onClick={() => router.push('/protected')}
            className="flex items-center text-[var(--color-text)] hover:text-[var(--color-primary)] transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Decks
          </button>
          
          {/* Right side - Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={addNewCard}
              className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-background-light)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-all flex items-center shadow-sm hover:scale-105 active:scale-95 duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Card
            </button>
            
            <button
              onClick={() => router.push(`/game?deckId=${deckId}`)}
              className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-background-light)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-all flex items-center shadow-sm hover:scale-105 active:scale-95 duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Practice
            </button>
          </div>
        </div>
      </div>

      {/* Add padding to the bottom of the main content to prevent it from being hidden behind the fixed bar */}
      <div className="pb-20"></div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-[var(--color-card-light)] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start mb-4">
              <div className="bg-[var(--color-error-text)]/10 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-error-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-dark)]">Delete Flashcard</h3>
                <p className="text-[var(--color-text)] mt-1">Are you sure you want to delete this flashcard? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCard}
                className="px-4 py-2 bg-[var(--color-error-text)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete deck confirmation modal */}
      {showDeleteDeckModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowDeleteDeckModal(false)}
        >
          <div 
            className="bg-[var(--color-card-light)] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start mb-4">
              <div className="bg-[var(--color-error-text)]/10 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-error-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-dark)]">Delete Entire Deck</h3>
                <p className="text-[var(--color-text)] mt-1">
                  Are you sure you want to delete the entire <strong>"{deckName}"</strong> deck? This will remove all {flashcards.length} flashcards and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteDeckModal(false)}
                className="px-4 py-2 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteDeck}
                className="px-4 py-2 bg-[var(--color-error-text)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Entire Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}