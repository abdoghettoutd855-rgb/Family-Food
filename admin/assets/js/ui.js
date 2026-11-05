
const sidebar = document.getElementById('sidebar');
const overlay = document.querySelector('[data-overlay]');
const menuBtn = document.querySelector('[data-menu-btn]');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  });
}
if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
}


function toast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<ion-icon name="${type === 'success' ? 'checkmark-circle' : 'alert-circle'}"></ion-icon><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}


function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) closeModal(e.target.id);
});


function formatPrice(n) {
  return Number(n || 0).toLocaleString('en-DZ') + ' دج';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function shortId(uuid) {
  return '#' + String(uuid).slice(0, 6).toUpperCase();
}

const STATUS_LABELS = {
  pending:   { ar: 'قيد الانتظار', cls: 'badge-gold' },
  preparing: { ar: 'قيد التحضير', cls: 'badge-orange' },
  ready:     { ar: 'جاهز',         cls: 'badge-blue' },
  delivered: { ar: 'تم التوصيل',   cls: 'badge-green' },
  cancelled: { ar: 'ملغي',         cls: 'badge-red' },
  confirmed: { ar: 'مؤكد',         cls: 'badge-blue' },
};

function statusBadge(status) {
  const s = STATUS_LABELS[status] || { ar: status, cls: 'badge-grey' };
  return `<span class="badge ${s.cls}">${s.ar}</span>`;
}

function paymentBadge(paymentStatus) {
  return paymentStatus === 'paid'
    ? '<span class="badge badge-green">مدفوع</span>'
    : '<span class="badge badge-red">غير مدفوع</span>';
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}


function loadingRow(cols) {
  return `<tr><td colspan="${cols}" class="table-loading">
    <ion-icon name="hourglass-outline" class="spin"></ion-icon> جاري التحميل...
  </td></tr>`;
}

function emptyRow(cols, msg = 'لا توجد بيانات') {
  return `<tr><td colspan="${cols}" class="table-empty">
    <ion-icon name="cube-outline"></ion-icon> ${msg}
  </td></tr>`;
}
