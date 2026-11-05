
(function () {
  const saved = JSON.parse(localStorage.getItem('ff_settings') || '{}');
  document.getElementById('set-name').value =
    saved.name && !/\u0066\u0061\u006d\u0069\u006c\u0079\s*\u0066\u006f\u006f\u0064/i.test(saved.name) ? saved.name : '';
  document.getElementById('set-phone').value = saved.phone || '';
  document.getElementById('set-address').value =
    saved.address && !/(\u006a\u0069\u006a\u0065\u006c|\u062c\u064a\u062c\u0644|\u0627\u0644\u0645\u064a\u0644\u064a\u0629|\u0065\u006c\u006d\u0069\u006c\u0069\u0061)/i.test(saved.address) ? saved.address : '';
  document.getElementById('set-tax').value = saved.tax ?? 19;
  document.getElementById('set-tables').value = saved.tables ?? 8;
})();

function saveSettings() {
  const settings = {
    name: document.getElementById('set-name').value.trim(),
    phone: document.getElementById('set-phone').value.trim(),
    address: document.getElementById('set-address').value.trim(),
    tax: parseFloat(document.getElementById('set-tax').value) || 0,
    tables: parseInt(document.getElementById('set-tables').value) || 8,
  };
  localStorage.setItem('ff_settings', JSON.stringify(settings));
  toast('تم حفظ الإعدادات');
}
