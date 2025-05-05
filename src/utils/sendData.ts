
import { ACCESS, AccessType } from "@/types/Access";
import { supabase } from "@/utils/supabase/client";

export const sendData = async <T>(table: string,  insertedValues: T[]) => {
    const { data, error } = await supabase
  .from(table)
  .insert(insertedValues).select()
  if (error) throw error;
  return data;
}

export const createDeck = async (uuid: string, deckName: string) => {

  const { data: deckData, error: deckError } = await supabase
    .from('Deck')
    .insert([{ deck_name: deckName, owner_id :uuid }])
    .select('deck_id, deck_name').single();;

  if (deckError) throw deckError;


  const { data, error } = await supabase
  .from('UserToDeck')
  .insert({ owner_id: uuid, deck_id: deckData.deck_id }).select();

  if (error) throw error;
  console.log(data);
  return data;
}


export const joinSharedDeck = async (uuid: string, deckID: number) => {
  const { data, error } = await supabase
  .from('UserToDeck')
  .insert({ owner_id: uuid, deck_id: deckID}).select();

  if (error) throw error;
  console.log(data);
  return data;
}



export const shareADeck = async (deckID: number, access_type: AccessType = ACCESS.READ) => {
  try {

    const { data: shareData, error: shareError } = await supabase
      .from('SharedDecks')
      .insert([
        {
          deck_id: deckID,
          access_type: access_type, 
          expiry_date: new Date(new Date().getTime() + 5 * 60000).toISOString() 
        }
      ])
      .select('share_token, expiry_date')  
      .single();

    if (shareError) throw shareError;

    const shareLink = `https://yourdomain.com/share/${shareData.share_token}`;

    return { shareLink, expiresAt: shareData.expiry_date };
  } catch (error) {
    console.error('Error sharing deck:', error);
    throw error; 
  }
};


export const sentStats = async (userid: string, accuracy: number, wpm: number,deckID?: number, cardID?: number) => {
  console.log("sentStats")
  if (deckID){
    const { data: deckStats, error: deckError } = await supabase
    .from('DeckMetrics')
    .insert({user_id: userid, deck_id: deckID, accuracy: accuracy, wpm: wpm}).select();
    if (deckError) throw deckError;
    console.log(deckStats)
    return deckStats;
  } else if (cardID) {
    const { data: deckStats, error: deckError } = await supabase
    .from('DeckMetrics')
    .insert({user_id: userid, card_id: cardID, accuracy: accuracy, wpm: wpm}).select();
    if (deckError) throw deckError;
    console.log(deckStats)
    return deckStats;
  } else {
    console.log("ERROR not a valid sentStats")
  }
}