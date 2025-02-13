import { supabase } from "@/utils/supabase/client";

export const getData = async (tableName : string) => {
    const { data, error } = await supabase
    .from(tableName)
    .select()
    if (error) throw error;
    return data;
}
