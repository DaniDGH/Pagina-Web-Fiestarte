import { supabase } from "../lib/supabase";

export const getInventory = async () => {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("id", { ascending: false });

  return { data, error };
};

export const createInventoryItem = async (payload) => {
  const { data, error } = await supabase
    .from("inventory")
    .insert([payload])
    .select()
    .single();

  return { data, error };
};

export const deleteInventoryItem = async (id) => {
  const { error } = await supabase
    .from("inventory")
    .delete()
    .eq("id", id);

  return { error };
};