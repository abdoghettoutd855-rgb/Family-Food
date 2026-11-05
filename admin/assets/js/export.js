
(async function () {
  const settings = JSON.parse(localStorage.getItem('ff_settings') || '{}');
  if (settings.name && !/\u0066\u0061\u006d\u0069\u006c\u0079\s*\u0066\u006f\u006f\u0064/i.test(settings.name)) {
    document.getElementById('export-rest-name').textContent = settings.name;
  }
  if (settings.phone) document.getElementById('export-rest-phone').textContent = 'هاتف: ' + settings.phone;
  const cleanAddress = settings.address && !/(\u006a\u0069\u006a\u0065\u006c|\u062c\u064a\u062c\u0644|\u0627\u0644\u0645\u064a\u0644\u064a\u0629|\u0065\u006c\u006d\u0069\u006c\u0069\u0061)/i.test(settings.address)
    ? settings.address : '';
  document.getElementById('export-footer').textContent =
    (cleanAddress ? cleanAddress + ' — ' : '') + 'شكراً لزيارتكم!';

  try {
    const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);
    const container = document.getElementById('export-categories');
    container.innerHTML = categories.map(cat => {
      const catItems = items.filter(i => i.category_id === cat.id && i.is_available);
      if (!catItems.length) return '';
      return `
        <div class="export-cat">
          <h2>${escapeHtml(cat.name_ar)}</h2>
          ${catItems.map(i => `
            <div class="export-item">
              <div class="export-item-info">
                <h3>${escapeHtml(i.name_ar)}</h3>
                <p>${escapeHtml(i.description_ar || '')}</p>
              </div>
              <div class="export-item-price">${formatPrice(i.price)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error(e);
    document.getElementById('export-categories').innerHTML =
      '<p class="center" style="color: var(--error-red)">تعذر تحميل القائمة — تحقق من إعدادات الاتصال</p>';
  }
})();
