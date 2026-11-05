
let employees = [];
let editingEmpId = null;

async function loadEmployees() {
  const body = document.getElementById('emp-body');
  body.innerHTML = loadingRow(6);
  try {
    const { data, error } = await sb.from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    employees = data;

    const search = document.getElementById('emp-search').value.trim().toLowerCase();
    const filtered = search
      ? employees.filter(e => (e.full_name + ' ' + (e.position || '')).toLowerCase().includes(search))
      : employees;

    if (!filtered.length) {
      body.innerHTML = emptyRow(6, 'لا يوجد موظفون');
      return;
    }
    body.innerHTML = filtered.map(e => `
      <tr>
        <td><strong>${escapeHtml(e.full_name)}</strong></td>
        <td><span class="badge badge-gold">${escapeHtml(e.position || '—')}</span></td>
        <td dir="ltr" style="text-align: right">${escapeHtml(e.phone || '—')}</td>
        <td>${e.salary ? formatPrice(e.salary) : '—'}</td>
        <td style="color: var(--quick-silver)">${e.hire_date || '—'}</td>
        <td style="white-space: nowrap">
          <button class="btn btn-outline btn-sm" onclick="openEmpForm('${e.id}')"><ion-icon name="create-outline"></ion-icon></button>
          <button class="btn btn-red btn-sm" onclick="removeEmp('${e.id}')"><ion-icon name="trash-outline"></ion-icon></button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
    body.innerHTML = emptyRow(6, 'تعذر تحميل الموظفين — تحقق من الاتصال');
  }
}

function openEmpForm(id = null) {
  editingEmpId = id;
  document.getElementById('emp-form').reset();
  document.getElementById('emp-modal-title').textContent = id ? 'تعديل موظف' : 'عامل جديد';
  if (id) {
    const e = employees.find(x => x.id === id);
    if (!e) return;
    document.getElementById('emp-name').value = e.full_name;
    document.getElementById('emp-position').value = e.position || '';
    document.getElementById('emp-phone').value = e.phone || '';
    document.getElementById('emp-email').value = e.email || '';
    document.getElementById('emp-salary').value = e.salary || '';
    document.getElementById('emp-hire').value = e.hire_date || '';
  }
  openModal('emp-modal');
}

async function saveEmp() {
  const emp = {
    full_name: document.getElementById('emp-name').value.trim(),
    position: document.getElementById('emp-position').value.trim(),
    phone: document.getElementById('emp-phone').value.trim(),
    email: document.getElementById('emp-email').value.trim(),
    salary: parseFloat(document.getElementById('emp-salary').value) || 0,
    hire_date: document.getElementById('emp-hire').value || null,
  };
  if (!emp.full_name || !emp.position) {
    toast('يرجى إدخال الاسم والمنصب على الأقل', 'error');
    return;
  }
  try {
    if (editingEmpId) {
      const { error } = await sb.from('employees').update(emp).eq('id', editingEmpId);
      if (error) throw error;
      toast('تم تحديث الموظف');
    } else {
      const { error } = await sb.from('employees').insert(emp);
      if (error) throw error;
      toast('تمت إضافة العامل');
    }
    closeModal('emp-modal');
    loadEmployees();
  } catch (e) {
    console.error(e);
    toast('فشل الحفظ', 'error');
  }
}

async function removeEmp(id) {
  const e = employees.find(x => x.id === id);
  if (!confirm(`هل تريد حذف "${e?.full_name}" نهائياً؟`)) return;
  try {
    const { error } = await sb.from('employees').delete().eq('id', id);
    if (error) throw error;
    toast('تم الحذف');
    loadEmployees();
  } catch (e) {
    console.error(e);
    toast('فشل الحذف', 'error');
  }
}

document.getElementById('emp-search').addEventListener('input', loadEmployees);
loadEmployees();
