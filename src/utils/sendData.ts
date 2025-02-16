
import { supabase } from "@/utils/supabase/client";

export const sendData = async <T>(table: string,  insertedValues: T[]) => {
    const { data, error } = await supabase
  .from(table)
  .insert(insertedValues).select()
  if (error) throw error;
  return data;
}




export const createDeck = async (uuid: string, deckName: string) => {
    const { data, error } = await supabase
  .from('Deck')
  .insert({ owner_id: uuid, deck_name: deckName }).select()
  if (error) throw error;
  console.log(data)
  return data;
}