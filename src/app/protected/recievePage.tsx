import { FlashCard } from '@/types/FlashCard';
import { fetchSharedLinkData, getADeck } from '@/utils/getData';
import React, { useState } from 'react';

const ShareDeckForm = () => {
    const [shareToken, setShareToken] = useState('');
    const [deckData, setDeckData] = useState(null);
    const [error, setError] = useState('');
    const [cardsList, setCardsList] = useState<FlashCard[] | null>(null);
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const data = await fetchSharedLinkData(shareToken);
  
        
        if (data.access_type === 'READ') {
          const cardData = await getADeck(data.deck_id);
          setCardsList(cardData);
          console.log(cardData)
        } else {
          const cardData = await getADeck(data.deck_id);
          setCardsList(cardData);
          setError("WRITE ENABLED");
        }
  
        setError(''); 
      } catch (err: unknown) {
        setDeckData(null);
        if (err instanceof Error) {
            throw new Error(err.message);
          }
        throw new Error("An unknown error occurred.");

      }
    };
  return (
    <div>
      <h2>Enter Share UUID</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={shareToken}
          onChange={(e) => setShareToken(e.target.value)}
          placeholder="Enter share token"
        />
        <button type="submit">Fetch Deck</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {deckData && (
        <div>
          <h3>Deck Details</h3>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(cardsList, null, 2)}
        </pre>
        </div>
      )}
    </div>
  );
};

export default ShareDeckForm;