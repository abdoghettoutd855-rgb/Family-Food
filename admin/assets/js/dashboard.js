
(async function () {
  try {
    const stats = await getDashboardStats();
    document.getElementById('stat-orders').textContent = stats.totalOrders;
    document.getElementById('stat-revenue').textContent = formatPrice(stats.revenue);
    document.getElementById('stat-menu').textContent = stats.menuItems;
    document.getElementById('stat-pending').textContent = stats.pendingOrders;
  } catch (e) {
    console.error(e);
    toast('تعذر تحميل الإحصائيات — تحقق من إعدادات الاتصال', 'error');
  }

  try {
    const orders = await getOrders();
    const body = document.getElementById('recent-orders-body');
    if (!orders.length) {
      body.innerHTML = emptyRow(5, 'لا توجد طلبات بعد');
      return;
    }
    body.innerHTML = orders.slice(0, 5).map(o => `
      <tr>
        <td>${shortId(o.id)}</td>
        <td>${escapeHtml(o.customers?.full_name || 'زائر')}</td>
        <td>${formatPrice(o.total)}</td>
        <td>${statusBadge(o.status)}</td>
        <td style="color: var(--quick-silver)">${timeAgo(o.created_at)}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
    document.getElementById('recent-orders-body').innerHTML = emptyRow(5, 'تعذر تحميل الطلبات');
  }
})();
