
let currentStatus = 'all';
let currentOrders = [];

const TYPE_LABELS = { 'dine-in': 'في المطعم', 'takeaway': 'سفري', 'delivery': 'توصيل' };

async function loadOrders() {
  const body = document.getElementById('orders-body');
  body.innerHTML = loadingRow(8);
  try {
    currentOrders = await getOrders(currentStatus);
    if (!currentOrders.length) {
      body.innerHTML = emptyRow(8, 'لا توجد طلبات بهذه الحالة');
      return;
    }
    body.innerHTML = currentOrders.map(o => `
      <tr>
        <td>${shortId(o.id)}</td>
        <td>${escapeHtml(o.customers?.full_name || 'زائر')}</td>
        <td><span class="badge badge-grey">${TYPE_LABELS[o.order_type] || o.order_type}</span></td>
        <td>${formatPrice(o.total)}</td>
        <td>${paymentBadge(o.payment_status)}</td>
        <td>${statusBadge(o.status)}</td>
        <td style="color: var(--quick-silver)">${timeAgo(o.created_at)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="openOrderDetails('${o.id}')"><ion-icon name="eye-outline"></ion-icon>تفاصيل</button></td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
    body.innerHTML = emptyRow(8, 'تعذر تحميل الطلبات — تحقق من الإعدادات');
  }
}

async function openOrderDetails(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) return;
  try {
    const items = await getOrderItems(orderId);
    document.getElementById('modal-order-id').textContent = shortId(order.id);
    document.getElementById('order-detail-content').innerHTML = `
      <div class="order-detail-row"><span>العميل</span><span>${escapeHtml(order.customers?.full_name || 'زائر')}</span></div>
      <div class="order-detail-row"><span>الهاتف</span><span dir="ltr">${escapeHtml(order.customers?.phone || order.delivery_phone || '—')}</span></div>
      <div class="order-detail-row"><span>نوع الطلب</span><span>${TYPE_LABELS[order.order_type] || order.order_type}</span></div>
      ${order.delivery_address ? `<div class="order-detail-row"><span>عنوان التوصيل</span><span>${escapeHtml(order.delivery_address)}</span></div>` : ''}
      <div class="order-detail-row"><span>الحالة</span><span>${statusBadge(order.status)}</span></div>
      <div class="order-detail-row"><span>الدفع</span><span>${paymentBadge(order.payment_status)}</span></div>

      <h3 style="margin: 16px 0 8px; font-size: 1.8rem">الأصناف</h3>
      <div class="order-items-list">
        ${items.map(i => `
          <div class="order-item-line">
            <span>${escapeHtml(i.item_name)} × ${i.quantity}</span>
            <span>${formatPrice(i.total_price)}</span>
          </div>`).join('') || '<p style="color: var(--quick-silver)">لا توجد أصناف</p>'}
      </div>

      <div class="order-detail-row"><span>المجموع الفرعي</span><span>${formatPrice(order.subtotal)}</span></div>
      <div class="order-detail-row"><span>الضريبة</span><span>${formatPrice(order.tax)}</span></div>
      <div class="order-detail-row" style="font-weight: 700; font-size: 1.6rem"><span>الإجمالي</span><span style="color: var(--gold-crayola)">${formatPrice(order.total)}</span></div>
    `;

    const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    document.getElementById('order-status-actions').innerHTML = `
      <h3 style="margin: 16px 0 8px; font-size: 1.8rem">تحديث الحالة</h3>
      <div class="status-actions">
        ${statuses.map(s => `<button class="filter-btn ${order.status === s ? 'active' : ''}" onclick="setOrderStatus('${order.id}', '${s}')">${STATUS_LABELS[s].ar}</button>`).join('')}
        <button class="filter-btn" onclick="togglePayment('${order.id}', '${order.payment_status}')">${order.payment_status === 'paid' ? 'تحديد كغير مدفوع' : 'تحديد كمدفوع'}</button>
      </div>
    `;
    openModal('order-modal');
  } catch (e) {
    console.error(e);
    toast('تعذر تحميل تفاصيل الطلب', 'error');
  }
}

async function setOrderStatus(orderId, status) {
  try {
    await updateOrderStatus(orderId, status);
    toast('تم تحديث حالة الطلب');
    closeModal('order-modal');
    loadOrders();
  } catch (e) {
    console.error(e);
    toast('فشل تحديث الحالة', 'error');
  }
}

async function togglePayment(orderId, current) {
  try {
    await updatePaymentStatus(orderId, current === 'paid' ? 'unpaid' : 'paid');
    toast('تم تحديث حالة الدفع');
    closeModal('order-modal');
    loadOrders();
  } catch (e) {
    console.error(e);
    toast('فشل تحديث الدفع', 'error');
  }
}

document.getElementById('status-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentStatus = btn.dataset.status;
  loadOrders();
});

loadOrders();
