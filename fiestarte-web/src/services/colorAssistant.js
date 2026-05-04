import { supabase } from "../lib/supabase";

export const saveColorHistory = async (payload) => {
  const { data, error } = await supabase
    .from("color_history")
    .insert([payload])
    .select()
    .single();

  return { data, error };
};