
let categories = [];
let menuItems = [];
let editingId = null;

async function loadCategories() {
  categories = await getCategories();
  const filter = document.getElementById('category-filter');
  filter.innerHTML = '<option value="">كل التصنيفات</option>' +
    categories.map(c => `<option value="${c.id}">${escapeHtml(c.name_ar)}</option>`).join('');
  // قائمة اقتراحات للتصنيف الحر (datalist)
  document.getElementById('categories-list').innerHTML =
    categories.map(c => `<option value="${escapeHtml(c.name_ar)}">`).join('');
}

/* البحث عن تصنيف بالاسم أو إنشاؤه إن لم يكن موجوداً */
async function resolveCategoryId(nameAr) {
  const existing = categories.find(c => c.name_ar === nameAr);
  if (existing) return existing.id;
  const slug = 'cat-' + Date.now();
  const { data, error } = await sb.from('categories')
    .insert({ slug, name_ar: nameAr, name_en: nameAr, sort_order: 99 })
    .select().single();
  if (error) throw error;
  categories.push(data);
  return data.id;
}

async function loadMenu() {
  const body = document.getElementById('menu-body');
  body.innerHTML = loadingRow(6);
  try {
    const catFilter = document.getElementById('category-filter').value;
    menuItems = await getMenuItems(catFilter || null);
    const search = document.getElementById('search-input').value.trim().toLowerCase();
    const filtered = search
      ? menuItems.filter(i => (i.name_ar + ' ' + i.name_en).toLowerCase().includes(search))
      : menuItems;

    if (!filtered.length) {
      body.innerHTML = emptyRow(6, 'لا توجد أصناف');
      return;
    }
    body.innerHTML = filtered.map(i => `
      <tr>
        <td>
          <strong>${escapeHtml(i.name_ar)}</strong><br>
          <span style="color: var(--quick-silver); font-size: 1.2rem">${escapeHtml(i.name_en)}</span>
        </td>
        <td><span class="badge badge-gold">${escapeHtml(i.categories?.name_ar || '—')}</span></td>
        <td>${formatPrice(i.price)}</td>
        <td><span class="switch ${i.is_available ? 'on' : ''}" onclick="toggleFlag('${i.id}', 'is_available', ${i.is_available})"></span></td>
        <td><span class="switch ${i.is_featured ? 'on' : ''}" onclick="toggleFlag('${i.id}', 'is_featured', ${i.is_featured})"></span></td>
        <td style="white-space: nowrap">
          <button class="btn btn-outline btn-sm" onclick="openItemForm('${i.id}')"><ion-icon name="create-outline"></ion-icon></button>
          <button class="btn btn-red btn-sm" onclick="removeItem('${i.id}')"><ion-icon name="trash-outline"></ion-icon></button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
    body.innerHTML = emptyRow(6, 'تعذر تحميل القائمة — تحقق من الإعدادات');
  }
}




function resolveMenuPreviewUrl(url) {
  if (!url) return '';
  // Database paths are stored relative to the public site root.
  // The admin pages live one directory below that root.
  if (url.startsWith('./assets/')) return '../' + url.slice(2);
  return url;
}

let pendingImageFile = null;

document.getElementById('item-image-file').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  // معاينة فورية قبل الرفع
  const url = URL.createObjectURL(file);
  document.getElementById('preview-img').src = url;
  document.getElementById('image-preview').style.display = 'block';
  pendingImageFile = file;
});

async function uploadImage(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const path = 'menu/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const { error } = await sb.storage.from('menu-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  const { data } = sb.storage.from('menu-images').getPublicUrl(path);
  return data.publicUrl;
}

function openItemForm(id = null) {
  editingId = id;
  const form = document.getElementById('item-form');
  form.reset();
  document.getElementById('item-available').classList.add('on');
  document.getElementById('item-featured').classList.remove('on');
  document.getElementById('item-modal-title').textContent = id ? 'تعديل صنف' : 'صنف جديد';

  pendingImageFile = null;
  document.getElementById('item-image-file').value = '';
  document.getElementById('image-preview').style.display = 'none';

  if (id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    document.getElementById('item-name-ar').value = item.name_ar;
    document.getElementById('item-name-en').value = item.name_en;
    document.getElementById('item-category').value = item.categories?.name_ar || '';
    if (item.image_url) {
      document.getElementById('preview-img').src = resolveMenuPreviewUrl(item.image_url);
      document.getElementById('image-preview').style.display = 'block';
    }
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-desc-ar').value = item.description_ar || '';
    document.getElementById('item-desc-en').value = item.description_en || '';
    document.getElementById('item-image').value = item.image_url || '';
    document.getElementById('item-available').classList.toggle('on', item.is_available);
    document.getElementById('item-featured').classList.toggle('on', item.is_featured);
  }
  openModal('item-modal');
}

async function saveItem() {
  const catName = document.getElementById('item-category').value.trim();
  const item = {
    name_ar: document.getElementById('item-name-ar').value.trim(),
    name_en: document.getElementById('item-name-en').value.trim(),
    price: parseFloat(document.getElementById('item-price').value) || 0,
    description_ar: document.getElementById('item-desc-ar').value.trim(),
    description_en: document.getElementById('item-desc-en').value.trim(),
    image_url: document.getElementById('item-image').value.trim(),
    is_available: document.getElementById('item-available').classList.contains('on'),
    is_featured: document.getElementById('item-featured').classList.contains('on'),
  };
  if (!item.name_ar || !catName) {
    toast('يرجى ملء الحقول المطلوبة', 'error');
    return;
  }
  try {

    if (pendingImageFile) {
      toast('جاري رفع الصورة...');
      item.image_url = await uploadImage(pendingImageFile);
    }

    item.category_id = await resolveCategoryId(catName);
    if (editingId) {
      await updateMenuItem(editingId, item);
      toast('تم تحديث الصنف');
    } else {
      await insertMenuItem(item);
      toast('تمت إضافة الصنف');
    }
    closeModal('item-modal');
    loadMenu();
  } catch (e) {
    console.error(e);
    toast('فشل الحفظ', 'error');
  }
}

async function removeItem(id) {
  const item = menuItems.find(i => i.id === id);
  if (!confirm(`هل تريد حذف "${item?.name_ar}" نهائياً؟`)) return;
  try {
    await deleteMenuItem(id);
    toast('تم الحذف');
    loadMenu();
  } catch (e) {
    console.error(e);
    toast('فشل الحذف', 'error');
  }
}

async function toggleFlag(id, field, current) {
  try {
    await updateMenuItem(id, { [field]: !current });
    loadMenu();
  } catch (e) {
    console.error(e);
    toast('فشل التحديث', 'error');
  }
}

document.getElementById('category-filter').addEventListener('change', loadMenu);
document.getElementById('search-input').addEventListener('input', loadMenu);

(async function init() {
  try {
    await loadCategories();
    await loadMenu();
  } catch (e) {
    console.error(e);
    document.getElementById('menu-body').innerHTML = emptyRow(6, 'تعذر الاتصال بقاعدة البيانات');
  }
})();
