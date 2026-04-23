import { supabase } from "../lib/supabase";

export const getInventoryItems = async () => {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("id", { ascending: true });

  return { data, error };
};

export const getOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  return { data, error };
};

export const createOrderWithItems = async (orderPayload) => {
  const { items, agenda, ...orderData } = orderPayload;

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (orderError) {
    return { error: orderError };
  }

  const mappedItems = items.map((item) => ({
    order_id: createdOrder.id,
    inventory_id: item.inventory_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(mappedItems);

  if (itemsError) {
    return { error: itemsError };
  }

  const agendaPayload = {
    order_id: createdOrder.id,
    customer_name: orderData.customer_name,
    customer_phone: orderData.customer_phone,
    order_type: orderData.order_type,
    event_date: agenda?.event_date || null,
    event_time: agenda?.event_time || null,
    notes: agenda?.notes || orderData.notes || "",
    status: "pendiente",
  };

  const { error: agendaError } = await supabase
    .from("agenda_entries")
    .insert([agendaPayload]);

  if (agendaError) {
    return { error: agendaError };
  }

  return { data: createdOrder, error: null };
};

export const getAgendaEntries = async () => {
  const { data, error } = await supabase
    .from("agenda_entries")
    .select(`
      id,
      order_id,
      customer_name,
      customer_phone,
      order_type,
      event_date,
      event_time,
      notes,
      status,
      created_at,
      order:order_id (
        id,
        deposit_amount,
        total_amount
      )
    `)
    .order("event_date", { ascending: true });

  return { data, error };
};

export const updateAgendaStatus = async (agendaId, newStatus) => {
  const { data, error } = await supabase
    .from("agenda_entries")
    .update({ status: newStatus })
    .eq("id", agendaId)
    .select()
    .single();

  return { data, error };
};

export const getOrderItemsByOrderId = async (orderId) => {
  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id,
      quantity,
      unit_price,
      subtotal,
      inventory:inventory_id (
        id,
        name,
        category,
        color,
        size
      )
    `)
    .eq("order_id", orderId);

  return { data, error };
};