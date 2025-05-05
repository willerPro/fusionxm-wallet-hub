// integrations/supabase/helpers.ts
import { supabase } from "@/integrations/supabase/client";

export const fetchBots = async (userId: string) => {
  const { data, error } = await supabase
    .from('bots')  // This needs to be a valid table name
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};
