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
