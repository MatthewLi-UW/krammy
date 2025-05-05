import { supabase } from "@/utils/supabase/client";

export const getData = async (tableName : string) => {
    const { data, error } = await supabase
    .from(tableName)
    .select()
    if (error) throw error;
    return data;
}

export const getADeck = async (deckID: number) => {
    const { data: deckData, error: deckError } = await supabase
    .from('CardsToDeck')
    .select().eq('deck_id', deckID)
    if (deckError) throw deckError;
    const cardIds = deckData.map(item => item.card_id) as number[];
    const { data, error } = await supabase
    .from('FlashCard')
    .select().in('card_id', cardIds)
    if (error) throw error;
    return data;
}

export const fetchSharedLinkData = async (shareToken: string) => {
  try {
    const { data, error } = await supabase
      .from('SharedDecks')
      .select('deck_id, access_type, expiry_date')
      .eq('share_token', shareToken)
      .single();

    if (!data) {
      throw new Error("Share link not found or expired.");
    }

    if (error) {
      throw error;
    }

    const now = new Date();
    if (new Date(data.expiry_date) < now) {
      throw new Error("The link has expired.");
    }

    return data; 
  } catch (err) {
    throw err; 
  }
};

export const cardsPerDeck = async (deckID: number[]) => {
  const { data: deckCounts, error: deckError } = await supabase
  .rpc('get_deck_counts', { deck_ids: deckID });
    if (deckError) throw deckError;
    console.log(deckCounts)
    return deckCounts;
}


export const getStats = async ( user_id: string, deckID: number, dataType: string) => {
  console.log("getStats")
  if (dataType == "DECK") {
    const { data: deckStats, error: deckError } = await supabase
    .from('DeckMetrics')
    .select().eq('deck_id', deckID).eq('user_id', user_id);
      if (deckError) throw deckError;
      console.log(deckStats)
      return deckStats;
  } else if (dataType == "CARD") {
  const { data: deckStats, error: deckError } = await supabase
  .from('DeckMetrics')
  .select().eq('card_id', deckID).eq('user_id', user_id);
    if (deckError) throw deckError;
    console.log(deckStats)
    return deckStats;
  } else {
    console.log("ERROR provide type DECK or CARD")
  }
}