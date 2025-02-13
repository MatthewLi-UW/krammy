import { supabase } from "@/utils/supabase/client";

export const sendData = async <T>(table: string,  insertedValues: T[]) => {
    const { error } = await supabase
  .from('table')
  .insert(insertedValues)
  if (error) throw error;
  return true;
}




export const createDeck = async (uuid: string) => {
    const { data, error } = await supabase
  .from('Deck')
  .insert(uuid).select()
  if (error) throw error;
  return data;
}