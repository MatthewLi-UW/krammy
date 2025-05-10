import { useState } from 'react';
import { fetchSharedLinkData, getADeck } from '@/utils/getData';
import { createDeck, sendData } from '@/utils/sendData';
import { supabase } from "@/utils/supabase/client";

interface ImportModalProps {
  userId: string;
  onClose: () => void;
  isOpen: boolean;
  onImportSuccess: () => void;
}

export default function ImportModal({ userId, onClose, isOpen, onImportSuccess }: ImportModalProps) {
  const [shareToken, setShareToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deckPreview, setDeckPreview] = useState<any>(null);
  const [step, setStep] = useState(1);
  
  if (!isOpen) return null;
  
  const handleLookup = async () => {
    if (!shareToken.trim()) {
      setError('Please enter a share code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch shared link data (gives us deck_id and access type)
      const shareData = await fetchSharedLinkData(shareToken, userId);
      // Get the original deck's name
      const { data: deckData, error: deckError } = await supabase
        .from('Deck')
        .select('deck_name')
        .eq('deck_id', shareData.deck_id)
        .single();
        
      if (deckError) throw deckError;
      
      // Get the card data
      const cardData = await getADeck(shareData.deck_id);
      
      setDeckPreview({
        cards: cardData,
        accessType: shareData.access_type,
        deckName: deckData?.deck_name || `Imported Deck`,
        deckId: shareData.deck_id
      });
      
      setStep(2);
    } catch (err) {
      console.error("Lookup error:", err);
      setError('Invalid or expired share code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImport = async () => {
    if (!deckPreview) {
      setError('Deck preview is not available.');
      return;
    }
    
    setIsLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      // Extract deck details for clarity
      const { accessType, deckId: originalDeckId, deckName: originalDeckName, cards } = deckPreview;
      
      // Check if the user already has access to this deck (to prevent duplicates)
      const { data: existingAccess } = await supabase
        .from('UserToDeck')
        .select('*')
        .eq('deck_id', originalDeckId)
        .eq('owner_id', userId)
        .maybeSingle();
      
      if (accessType === 'READ') {
        // READ ACCESS: Only create a local copy, don't add UserToDeck entry
        console.log("Creating local copy for READ access");
        
        // 1. Create a new deck with a clear "(Copy)" indicator
        const newDeckResponse = await createDeck(userId, originalDeckName + " (Copy)");
        const newDeck = newDeckResponse[0];
        
        if (!newDeck || !newDeck.deck_id) {
          throw new Error('Failed to create new deck');
        }
        
        // 2. Create new flashcards owned by the user
        const cardData = cards.map(card => ({
          front: card.front,
          back: card.back,
          owner_id: userId
        }));
        
        const newCards = await sendData('FlashCard', cardData);
        
        // 3. Link the new cards to the new deck
        const cardLinks = newCards.map(card => ({
          card_id: card.card_id,
          deck_id: newDeck.deck_id,
          owner_id: userId
        }));
        
        await sendData('CardsToDeck', cardLinks);
        
        // Important: Remove any existing access to the original deck if it exists
        if (existingAccess) {
          await supabase
            .from('UserToDeck')
            .delete()
            .eq('deck_id', originalDeckId)
            .eq('owner_id', userId);
        }
      } 
      else {
        // WRITE ACCESS: Only add a link to the original deck, don't create a copy
        console.log("Adding link to original deck for WRITE access");
        
        // Only add the link if it doesn't already exist
        if (!existingAccess) {
          await supabase
            .from('UserToDeck')
            .insert({ 
              owner_id: userId, 
              deck_id: originalDeckId
            });
        }
      }
      
      onImportSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Import error:", err);
      setError('Failed to import deck. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-background-light)] rounded-xl shadow-lg max-w-md w-full animate-scaleIn">
        <div className="p-5 border-b border-[var(--color-card-medium)]/30">
          <h3 className="text-xl font-bold text-[var(--color-text-dark)]">
            {step === 1 ? 'Import Shared Deck' : 'Confirm Import'}
          </h3>
        </div>
        
        <div className="p-6">
          {step === 1 ? (
            <>
              <p className="text-[var(--color-text)] mb-4">
                Enter the share code you received to import a deck
              </p>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={shareToken}
                  onChange={(e) => setShareToken(e.target.value)}
                  placeholder="Share code"
                  className="w-full p-3 bg-[var(--color-card-light)] border border-[var(--color-card-medium)]/50 rounded-lg"
                />
              </div>
              
              {error && (
                <div className="mb-4 text-[var(--color-error-text)] text-sm">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleLookup}
                disabled={isLoading}
                className="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Continue'
                )}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h4 className="font-medium text-lg text-[var(--color-text-dark)] mb-1">
                  {deckPreview?.deckName}
                </h4>
                <p className="text-[var(--color-text-light)] text-sm">
                  You&apos;re about to import this deck to your collection
                </p>
              </div>
              
              <div className="mb-6">
                <div className="bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-card-medium)]/30">
                  <div className="flex items-center justify-between border-b border-[var(--color-card-medium)]/20 pb-2 mb-2">
                    <p className="font-medium text-[var(--color-text)]">
                      Cards
                    </p>
                    <p className="text-[var(--color-primary)] font-semibold">
                      {deckPreview?.cards?.length || 0}
                    </p>
                  </div>
                  <p className="text-[var(--color-text-light)] text-sm">
                    Access: {deckPreview?.accessType === 'READ' ? 'View Only' : 'Edit Access'}
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 text-[var(--color-error-text)] text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-[var(--color-secondary)] text-[var(--color-text-dark)] rounded-lg hover:bg-[var(--color-secondary-dark)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    'Import Deck'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        
        {step === 1 && (
          <div className="p-4 border-t border-[var(--color-card-medium)]/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--color-text)] hover:text-[var(--color-text-dark)] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}