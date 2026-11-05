

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


async function getOrders(status = null) {
  let query = sb.from('orders')
    .select('*, customers(full_name, phone)')
    .order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getOrderItems(orderId) {
  const { data, error } = await sb.from('order_items')
    .select('*')
    .eq('order_id', orderId);
  if (error) throw error;
  return data;
}

async function updateOrderStatus(orderId, status) {
  const { error } = await sb.from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

async function updatePaymentStatus(orderId, paymentStatus) {
  const { error } = await sb.from('orders')
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}


async function getCategories() {
  const { data, error } = await sb.from('categories')
    .select('*').order('sort_order');
  if (error) throw error;
  return data;
}

async function getMenuItems(categoryId = null) {
  let query = sb.from('menu_items')
    .select('*, categories(name_ar)')
    .order('name_en');
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function insertMenuItem(item) {
  const { error } = await sb.from('menu_items').insert(item);
  if (error) throw error;
}

async function updateMenuItem(id, item) {
  const { error } = await sb.from('menu_items')
    .update({ ...item, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

async function deleteMenuItem(id) {
  const { error } = await sb.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

async function getDashboardStats() {
  const [orders, paidOrders, menuCount, pendingCount] = await Promise.all([
    sb.from('orders').select('id', { count: 'exact', head: true }),
    sb.from('orders').select('total').eq('payment_status', 'paid'),
    sb.from('menu_items').select('id', { count: 'exact', head: true }),
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  const revenue = (paidOrders.data || []).reduce((s, o) => s + Number(o.total), 0);
  return {
    totalOrders: orders.count || 0,
    revenue,
    menuItems: menuCount.count || 0,
    pendingOrders: pendingCount.count || 0,
  };
}
