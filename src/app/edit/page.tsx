'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";
import { FlashCard } from "@/types/FlashCard";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getADeck } from '@/utils/getData';

// Sortable card wrapper component
const SortableFlashcard = ({ card, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.card_id.toString() });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0 : 1, 
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const, 
    marginBottom: '20px', 
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      
      className={`mb-5 ${isDragging ? 'border-2 border-[var(--color-primary)]' : ''} ${!isDragging ? 'animate-scaleIn' : ''}`}
    >
      <div className="relative group">
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move opacity-40 group-hover:opacity-100 transition-opacity z-10"
        >
          <svg className="w-6 h-6 text-[var(--color-text-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
        <div className="pl-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// Content component that uses useSearchParams
function EditDeckContent() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deckLoading, setDeckLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [deckName, setDeckName] = useState<string>("");
  const [editingDeckName, setEditingDeckName] = useState(false);
  // const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [showDeleteDeckModal, setShowDeleteDeckModal] = useState(false);
  const [activeEditCardId, setActiveEditCardId] = useState<number | null>(null);
  const endOfCardsRef = useRef<HTMLDivElement>(null);
  const [orderedCards, setOrderedCards] = useState<FlashCard[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');
  const deckNameParam = searchParams.get('deckName');

  // Update ordered cards when flashcards change
  useEffect(() => {
    setOrderedCards([...flashcards]);
  }, [flashcards]);
  
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
// Handle drag end event
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  setActiveId(null);
  
  if (!over) return;
  
  if (active.id !== over.id) {
    // Calculate the new order
    const oldIndex = orderedCards.findIndex(item => item.card_id.toString() === active.id);
    const newIndex = orderedCards.findIndex(item => item.card_id.toString() === over.id);
    
    // Create the new ordered array
    const newOrderedCards = arrayMove([...orderedCards], oldIndex, newIndex);
    
    // First update the UI state
    setOrderedCards(newOrderedCards);
    
    // Then pass the new array directly to updateCardOrder
    updateCardOrder(active.id.toString(), over.id.toString(), newOrderedCards);
  }
};
  
const updateCardOrder = async (activeId: string, overId: string, newOrderedCards: FlashCard[]) => {
  if (!deckId || !user) return;

  try {
    // Convert deckId to number
    const numericDeckId = parseInt(deckId);
    
    console.log("Starting batch card position update...");
    
    // Create a stored procedure that handles all position updates in a single database call
    const { error } = await supabase.rpc('update_card_positions', {
      p_deck_id: numericDeckId,
      p_card_ids: newOrderedCards.map(card => card.card_id),
      p_owner_id: user.id
    });
    
    if (error) {
      console.error("Batch update error:", error);
      throw error;
    }
    
    console.log("Card order updated successfully");
    // setToast({message: "Card order updated", type: 'success'});
    
    // Wait a moment before checking to ensure database has time to commit
    setTimeout(() => checkCardPositions(), 500);
    
  } catch (error) {
    console.error("Error updating card order:", error);
    // setToast({message: "Failed to update card order", type: 'error'});
  }
};

const checkCardPositions = async () => {
  if (!deckId) return;
  
  const { data, error } = await supabase
    .from('CardsToDeck')
    .select('card_id, position')
    .eq('deck_id', parseInt(deckId))
    .order('position');
    
  console.log("Current card positions:", data);
  
  if (error) {
    console.error("Error checking positions:", error);
  }
};


  // Auto-dismiss toast after 4 seconds
  // useEffect(() => {
  //   if (toast) {
  //     const timer = setTimeout(() => {
  //       // Start fade out animation before removal
  //       const toastElement = document.getElementById('toast-notification');
  //       if (toastElement) {
  //         toastElement.classList.add('animate-fadeOut');
  //         // Wait for animation to complete before removing
  //         setTimeout(() => setToast(null), 300);
  //       } else {
  //         setToast(null);
  //       }
  //     }, 4000);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [toast]);

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
      if (!deckId) {
        router.push('/protected'); // Redirect if no deckId
        return;
      }

      setDeckLoading(true);

      try {
        // Get the deck information first
        const { data: deckData, error: deckError } = await supabase
          .from('Deck')
          .select('deck_name, owner_id')
          .eq('deck_id', deckId)
          .single();

        if (deckError) {
          // Redirect for any deck errors (not found, permission denied, etc.)
          router.push('/protected');
          return;
        }
        
        // Check permissions
        if (!user) {
          router.push('/protected');
          return;
        }
        
        if (deckData) setDeckName(deckData.deck_name);
        
        // Fetch cards using a join query, similar to how the game loads cards
        const { data: joinData, error: joinError } = await supabase
          .from('CardsToDeck')
          .select(`
            card_id,
            position,
            FlashCard(*)
          `)
          .eq('deck_id', deckId)
          .order('position');
        
        if (joinError) {
          // Redirect for any errors loading cards
          router.push('/protected');
          return;
        }
        
       // Process cards normally if everything is successful
        if (joinData && joinData.length > 0) {
          // First, create objects with position for sorting
          const cardsWithPosition = joinData.map(item => ({
            ...item.FlashCard,
            _position: item.position
          }));

          // Sort by position
          const sorted = [...cardsWithPosition].sort((a, b) => 
            (a._position ?? 0) - (b._position ?? 0)
          );
          
          // Then remove the _position property to make them compatible with FlashCard type
          const cleanCards = sorted.map((card:any)=> {
            // Extract all needed FlashCard properties explicitly
            const { card_id, owner_id, created_at, front, back } = card;
            
            // Return a properly typed object
            return {
              card_id,
              owner_id, 
              created_at,
              front,
              back
            };
          });
          // Now set the state with clean cards matching the FlashCard type
          setFlashcards(cleanCards);
        } else {
          setFlashcards([]);
        }
      } catch (error) {
        // Catch-all error handler - redirect for any other errors
        console.error("Error in deck page:", error);
        router.push('/protected');
        return;
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
      // setToast({message: "Deck name updated successfully", type: 'success'});
    } catch (error) {
      console.error("Error updating deck name:", error);
      // setToast({message: "Failed to update deck name", type: 'error'});
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
      
      // setToast({message: "Card updated successfully", type: 'success'});
    } catch (error) {
      console.error("Error updating card:", error);
      // setToast({message: "Failed to update card", type: 'error'});
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
      // setToast({message: "Card deleted successfully", type: 'success'});
    } catch (error) {
      console.error("Error deleting card:", error);
      // setToast({message: "Failed to delete card", type: 'error'});
    } finally {
      // Close the modal
      setShowDeleteModal(false);
      setCardToDelete(null);
    }
  };

  // Add new flashcard
  const addNewCard = async () => {
    if (!deckId || !user || isAddingCard) return;
    
    // Set the loading state to prevent multiple clicks
    setIsAddingCard(true);
    
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

      const numericDeckId = parseInt(deckId);
      
      // Get the highest current position value, forcing a fresh read from DB
      const { data: positionData, error: positionError } = await supabase
        .from('CardsToDeck')
        .select('position')
        .eq('deck_id', numericDeckId)
        .order('position', { ascending: false })
        .limit(1);
        
      if (positionError) throw positionError;
      
      // Calculate the next position
      let nextPosition = 0;
      if (positionData && positionData.length > 0) {
        const highestPosition = typeof positionData[0].position === 'number' 
          ? positionData[0].position 
          : parseInt(positionData[0].position);
        nextPosition = highestPosition + 1;
      }
      
      console.log("Adding new card at position:", nextPosition);
      
      // Link to deck with the new position
      const { error: linkError } = await supabase
        .from('CardsToDeck')
        .insert({
          deck_id: numericDeckId,
          card_id: newCard.card_id,
          owner_id: user.id,
          position: nextPosition
        });
        
      if (linkError) throw linkError;
      
      // Update local state with the new card
      setFlashcards([...flashcards, newCard]);
      
      // Scroll to the newly added card after a small delay
      setTimeout(() => {
        endOfCardsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
        
    } catch (error) {
      console.error("Error adding new card:", error);
    } finally {
      // Reset the loading state regardless of success or failure
      setIsAddingCard(false);
    }
  };

  // Delete deck
  const deleteDeck = async () => {
    if (!deckId) return;
    
    try {
      // Convert deckId to a number for database operations
      const numericDeckId = parseInt(deckId, 10);
      
      console.log("Attempting to delete deck ID:", numericDeckId);
      
      const cardData = await getADeck(numericDeckId);

      const ArrayofCardID = (await cardData).map(item => item.card_id);

      const { error: deleteError } = await supabase
          .from('FlashCard')
          .delete()
          .in('card_id', ArrayofCardID);

      if (deleteError) {
          console.error('Error deleting cards from deck:', deleteError);
      } else {
          console.log('Cards removed from deck successfully');
      }

      const { data: deckData, error: deckError } = await supabase
        .from('Deck')
        .delete()
        .eq('deck_id', numericDeckId)
      
        
      if (deckError) {
        console.error("Error fetching deck before deletion:", deckError);
        throw deckError;
      }
      
      
      setTimeout(() => {
        router.push('/protected');
      }, 500);
    } catch (error) {
      console.error("Error deleting deck:", error);
      // setToast({message: "Failed to delete deck", type: 'error'});
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
    const [front, setFront] = useState(card.front);
    const [back, setBack] = useState(card.back);
    const termInputRef = useRef<HTMLTextAreaElement>(null);
    
    // Check if this card is the one being edited
    const isEditing = activeEditCardId === card.card_id;

    // Auto-focus the term input when editing starts
    useEffect(() => {
      if (isEditing && termInputRef.current) {
        const textLength = termInputRef.current.value.length;
        termInputRef.current.focus();
        termInputRef.current.setSelectionRange(textLength, textLength);
      }
    }, [isEditing]);

    // Start editing this card
    const startEditing = () => {
      // If another card is being edited, save it first
      if (activeEditCardId !== null && activeEditCardId !== card.card_id) {
        // Find the card being edited
        const editingCard = flashcards.find(c => c.card_id === activeEditCardId);
        if (editingCard) {
          // Get the current form values from the DOM
          const frontElem = document.getElementById(`term-${activeEditCardId}`) as HTMLTextAreaElement;
          const backElem = document.getElementById(`definition-${activeEditCardId}`) as HTMLTextAreaElement;
          
          if (frontElem && backElem) {
            // Save the currently edited card
            updateCard({
              ...editingCard,
              front: frontElem.value,
              back: backElem.value
            });
          }
        }
      }
      
      // Now set this card as the active one
      setActiveEditCardId(card.card_id);
    };

    const handleSave = () => {
      updateCard({
        ...card,
        front,
        back
      });
      setActiveEditCardId(null); // Close edit mode
    };

    return (
    <div 
      className="bg-[var(--color-card-light)] rounded-xl shadow-md overflow-hidden border border-[var(--color-card-medium)]/50 relative hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={(e) => {
        // Only start editing if we're not already editing and if the click didn't come from a button
        if (!isEditing && (e.target as HTMLElement).tagName !== 'BUTTON' && 
            !(e.target as HTMLElement).closest('button')) {
          startEditing();
        }
      }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Term side */}
        <div className="p-6 md:w-1/2 bg-[var(--color-secondary)]/20 border-b md:border-b-0 md:border-r border-[var(--color-card-medium)]/30 relative">
          <h3 className="text-md font-medium text-[var(--color-text-light)] mb-2">Term</h3>
          
          {isEditing ? (
            <textarea
              ref={termInputRef}
              id={`term-${card.card_id}`}
              className="text-lg text-[var(--color-text-dark)] w-full bg-[var(--color-background-light)]/20 border border-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-background-light)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 rounded-md p-2 min-h-[4rem] resize-none transition-all"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent triggering card click
              placeholder="Enter term..."
            />
          ) : (
            <p className="text-lg text-[var(--color-text-dark)]">
              {card.front}
            </p>
          )}
        </div>

        {/* Definition side */}
        <div className="p-6 md:w-1/2 relative">
          <h3 className="text-md font-medium text-[var(--color-text-light)] mb-2">Definition</h3>
          
          {isEditing ? (
            <textarea
              id={`definition-${card.card_id}`}
              className="text-lg text-[var(--color-text-dark)] w-full bg-[var(--color-background-light)]/20 border border-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:bg-[var(--color-background-light)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 rounded-md p-2 min-h-[4rem] resize-none transition-all"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent triggering card click
              placeholder="Enter definition..."
            />
          ) : (
            <p className="text-lg text-[var(--color-text-dark)]">
              {card.back}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="p-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
              aria-label="Save"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFront(card.front); // Reset to original value
                setBack(card.back);
                setActiveEditCardId(null);
              }}
              className="p-2 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
              aria-label="Cancel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCard(card.card_id.toString());
            }}
            className="p-2 text-[var(--color-error-text)] bg-[var(--color-error-text)]/10 rounded-lg hover:bg-[var(--color-error-text)]/20 transition-colors"
            aria-label="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Help text */}
      {!isEditing && (
        <div className="absolute hidden group-hover:block bottom-1 right-3 text-sm text-[var(--color-text-light)] bg-[var(--color-background-light)]/80 px-2 py-1 rounded">
          Click card to edit
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
        {/* Toast notification - moved to top-right corner */}
        {/* {toast && (
          <div 
            id="toast-notification"
            className="fixed top-6 right-6 z-50 pointer-events-none max-w-sm"
          >
            <div 
              className={`py-3 px-4 rounded-lg shadow-lg pointer-events-auto
                ${toast.type === 'success' 
                  ? 'bg-success text-white' 
                  : 'bg-[var(--color-error-text)] text-white'
                } flex items-center justify-between
                animate-slideInRight
              `}
            >
              <div className="flex items-center">
                {toast.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 24 24" stroke="currentColor">
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
        )} */}
        
        {/* header section with just deck name */}
        <div className=" p-5 rounded-xl mb-8 ml-4">
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
        
        {/* Flashcards grid with drag and drop */}
        <div className="space-y-5">
          {orderedCards.length > 0 ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedCards.map(card => card.card_id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="flashcard-container">
                  {orderedCards.map((card) => (
                    <SortableFlashcard key={card.card_id} card={card}>
                      <FlashcardEditor card={card} />
                    </SortableFlashcard>
                  ))}
                </div>
              </SortableContext>
              
              {/* Drag overlay to show the card being dragged */}
              <DragOverlay adjustScale={false} className="z-[900]">
                {activeId ? (
                  <div className="opacity-100 w-full">
                    <div className="pl-8">
                      <FlashcardEditor 
                        card={orderedCards.find(card => card.card_id.toString() === activeId)!} 
                      />
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
              
              {/* Reference div at the end of cards for scrolling */}
              <div ref={endOfCardsRef}></div>
            </DndContext>
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
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-background-light)] shadow-lg border-t border-[var(--color-card-medium)]/30 py-3 px-4 z-[1001]">
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
              disabled={isAddingCard}
              className={`px-4 py-2 bg-[var(--color-primary)] text-[var(--color-background-light)] rounded-lg transition-all flex items-center shadow-sm duration-150 ${
                isAddingCard 
                  ? 'cursor-not-allowed' 
                  : 'hover:bg-[var(--color-primary-dark)] hover:scale-105 active:scale-95'
              }`}
            >
              {isAddingCard ? (
                <>
                  <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Card
                </>
              )}
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
                  Are you sure you want to delete the entire <strong>&quot;{deckName}&quot;</strong> deck? This will remove all {flashcards.length} flashcards and cannot be undone.
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

// Main exported component with Suspense boundary
export default function EditDeckPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    }>
      <EditDeckContent />
    </Suspense>
  );
}