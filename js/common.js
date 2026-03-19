
const App = (() => {
  const HANDLE_DB = 'acrd_handles_db';
  const HANDLE_STORE = 'handles';
  const HANDLE_KEY = 'data_folder';
  const THEME_KEY = 'acrd_theme';
  const MENU_KEY = 'acrd_menu_hidden';
  const PAGE_YEAR_KEY = 'acrd_year_filter';
  const seeds = {};
  let folderHandle = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
  function uid() { return crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2); }
  function nowISO() { return new Date().toISOString(); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function getUser() { return 'Roxo'; }
  function confirmAction(msg) { return window.confirm(msg); }
  function formatEuro(v) { return new Intl.NumberFormat('pt-PT', { style:'currency', currency:'EUR' }).format(Number(v || 0)); }
  function formatDateTime(v) { if (!v || v === 'N.A.') return 'N.A.'; try { return new Intl.DateTimeFormat('pt-PT',{dateStyle:'short', timeStyle:'short'}).format(new Date(v)); } catch { return String(v); } }
  function sortRows(rows, key, dir='asc') {
    const m = dir === 'asc' ? 1 : -1;
    return [...rows].sort((a,b) => {
      const va = a?.[key];
      const vb = b?.[key];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * m;
      return String(va ?? '').localeCompare(String(vb ?? ''), 'pt') * m;
    });
  }
  function numberToWordsPt(n) {
    n = Math.round(Number(n) || 0);
    if (n === 0) return 'zero';
    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez','onze','doze','treze','catorze','quinze','dezasseis','dezassete','dezoito','dezanove'];
    const tens = ['', '', 'vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
    const hundreds = ['', 'cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
    function below1000(x) {
      if (x === 0) return '';
      if (x === 100) return 'cem';
      let parts = [];
      const c = Math.floor(x / 100);
      const r = x % 100;
      if (c) parts.push(hundreds[c]);
      if (r) {
        if (r < 10) parts.push(units[r]);
        else if (r < 20) parts.push(teens[r-10]);
        else {
          const t = Math.floor(r/10), u = r % 10;
          parts.push(tens[t] + (u ? ' e ' + units[u] : ''));
        }
      }
      return parts.filter(Boolean).join(' e ');
    }
    const millions = Math.floor(n / 1000000);
    const thousands = Math.floor((n % 1000000) / 1000);
    const rest = n % 1000;
    let parts = [];
    if (millions) parts.push(millions === 1 ? 'um milhão' : below1000(millions) + ' milhões');
    if (thousands) parts.push(thousands === 1 ? 'mil' : below1000(thousands) + ' mil');
    if (rest) parts.push(below1000(rest));
    return parts.join(parts.length > 1 ? ' e ' : '');
  }
  function moneyToWordsPt(value) {
    const num = Number(value || 0);
    const euros = Math.floor(num);
    const cents = Math.round((num - euros) * 100);
    const euroPart = `${numberToWordsPt(euros)} ${euros === 1 ? 'euro' : 'euros'}`;
    const centPart = `${numberToWordsPt(cents)} ${cents === 1 ? 'cêntimo' : 'cêntimos'}`;
    return cents ? `${euroPart} e ${centPart}` : euroPart;
  }
function dateToWordsPt(dateStr) {
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const d = new Date(dateStr);
  if (isNaN(d)) return 'N.A.';

  return `${numberToWordsPt(d.getDate())} dias do mês de ${months[d.getMonth()]} do ano de ${numberToWordsPt(d.getFullYear())}`;
}
  function registerSeed(name, data) { seeds[name] = data; }
  function seed(name) { return structuredClone(seeds[name] || []); }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(HANDLE_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function saveHandle(handle) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      tx.objectStore(HANDLE_STORE).put(handle, HANDLE_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function loadHandle() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readonly');
      const req = tx.objectStore(HANDLE_STORE).get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  async function verifyPermission(handle, readwrite = true) {
    if (!handle) return false;
    const mode = readwrite ? 'readwrite' : 'read';
    if ((await handle.queryPermission({ mode })) === 'granted') return true;
    if ((await handle.requestPermission({ mode })) === 'granted') return true;
    return false;
  }
  async function getFolderHandle() {
    if (folderHandle && await verifyPermission(folderHandle, true)) return folderHandle;
    try {
      const stored = await loadHandle();
      if (stored && await verifyPermission(stored, true)) { folderHandle = stored; return folderHandle; }
    } catch {}
    return null;
  }
  async function chooseDataFolder() {
    if (!window.showDirectoryPicker) {
      alert('Este browser não suporta escrita direta em ficheiros locais. Usa Chrome, Edge ou outro Chromium recente.');
      return null;
    }
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    if (await verifyPermission(handle, true)) {
      folderHandle = handle;
      await saveHandle(handle);
      window.dispatchEvent(new CustomEvent('acrd:data-folder-changed'));
      return handle;
    }
    return null;
  }
  async function readJson(fileName, fallbackData = []) {
    const handle = await getFolderHandle();
    if (!handle) return structuredClone(fallbackData);
    try {
      const fh = await handle.getFileHandle(fileName);
      const file = await fh.getFile();
      const text = await file.text();
      return text ? JSON.parse(text) : structuredClone(fallbackData);
    } catch {
      return structuredClone(fallbackData);
    }
  }
  async function writeJson(fileName, data) {
    const handle = await getFolderHandle() || await chooseDataFolder();
    if (!handle) throw new Error('Sem pasta de dados selecionada.');
    const fh = await handle.getFileHandle(fileName, { create: true });
    const writable = await fh.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }
async function updateFooter(ui) {
  const year =
    ui?.yearSelect?.value === 'Todos'
      ? String(new Date().getFullYear())
      : (ui?.yearSelect?.value || String(new Date().getFullYear()));

  const faturacao = await readJson('faturacao.json', seed('faturacao.json'));

  const rows = faturacao.filter(r => String(r.ano) === year);

  const despesa = rows
    .filter(r => String(r.tipo).toUpperCase() === 'DESPESA')
    .reduce((s, r) => s + Number(r.montante || 0), 0);

  const receita = rows
    .filter(r => String(r.tipo).toUpperCase() === 'RECEITA')
    .reduce((s, r) => s + Number(r.montante || 0), 0);

  const saldo = receita - despesa;

  const tesourariaRows = rows.filter(r => {
    const origem = String(r.origem || '').toUpperCase().trim();
    return origem === 'CAIXA' || origem === 'CAIXA-BAR';
  });

  const tesourariaReceita = tesourariaRows
    .filter(r => String(r.tipo).toUpperCase() === 'RECEITA')
    .reduce((s, r) => s + Number(r.montante || 0), 0);

  const tesourariaDespesa = tesourariaRows
    .filter(r => String(r.tipo).toUpperCase() === 'DESPESA')
    .reduce((s, r) => s + Number(r.montante || 0), 0);

  const tesourariaSaldo = tesourariaReceita - tesourariaDespesa;

  const barRows = rows.filter(r => {
    const origem = String(r.origem || '').toUpperCase().trim();
    return origem === 'CAIXA-BAR';
  });

  const barReceita = barRows
    .filter(r => String(r.tipo).toUpperCase() === 'RECEITA')
    .reduce((s, r) => s + Number(r.montante || 0), 0);

  const barDespesa = barRows
    .filter(r => String(r.tipo).toUpperCase() === 'DESPESA')
    .reduce((s, r) => s + Number(r.montante || 0), 0);

  const barSaldo = barReceita - barDespesa;

  if (ui.footerYear) ui.footerYear.textContent = `Ano: ${year}`;
  if (ui.footerDespesa) ui.footerDespesa.textContent = `Despesa: ${formatEuro(despesa)}`;
  if (ui.footerReceita) ui.footerReceita.textContent = `Receita: ${formatEuro(receita)}`;
  if (ui.footerSaldo) ui.footerSaldo.textContent = `Saldo: ${formatEuro(saldo)}`;
  if (ui.footerBanco) ui.footerBanco.textContent = `Tesouraria: ${formatEuro(tesourariaSaldo)}`;
  if (ui.footerCaixa) ui.footerCaixa.textContent = `Bar: ${formatEuro(barSaldo)}`;
}
  function getUi() {
    return {
      menuToggle: document.getElementById('menuToggle'),
      themeToggle: document.getElementById('themeToggle'),
      openDataFolderBtn: document.getElementById('openDataFolderBtn'),
      dataFolderStatus: document.getElementById('dataFolderStatus'),
      search: document.getElementById('globalSearch'),
      yearSelect: document.getElementById('yearFilter'),
      sidebar: document.getElementById('sidebar'),
      main: document.getElementById('main'),
      footerYear: document.getElementById('footerYear'),
      footerDespesa: document.getElementById('footerDespesa'),
      footerReceita: document.getElementById('footerReceita'),
      footerSaldo: document.getElementById('footerSaldo'),
      footerBanco: document.getElementById('footerBanco'),
      footerCaixa: document.getElementById('footerCaixa'),
      menuFrame: document.getElementById('menuFrame')
    };
  }
  async function applyFolderStatus(ui) {
    const handle = await getFolderHandle();
    if (ui.dataFolderStatus) ui.dataFolderStatus.textContent = handle ? `Dados: ${handle.name}` : 'Dados: amostra';
  }
  function wireCommon(pageKey, options = {}) {
    const ui = getUi();
    document.body.classList.toggle('dark', localStorage.getItem(THEME_KEY) === 'dark');
    const hidden = localStorage.getItem(MENU_KEY) === 'true';
    ui.sidebar?.classList.toggle('hidden', hidden);
    ui.main?.classList.toggle('full', hidden);
function syncMenuTheme() {
  if (!ui.menuFrame || !ui.menuFrame.contentWindow) return;
  ui.menuFrame.contentWindow.postMessage(
    {
      type: 'acrd-theme',
      theme: document.body.classList.contains('dark') ? 'dark' : 'light'
    },
    '*'
  );
}

if (ui.menuFrame) {
  ui.menuFrame.addEventListener('load', syncMenuTheme);
  ui.menuFrame.src = `partials/menu.html?page=${pageKey}`;
}    if (ui.menuFrame) ui.menuFrame.src = `partials/menu.html?page=${pageKey}`;
    if (ui.search && options.searchPlaceholder) ui.search.placeholder = options.searchPlaceholder;
    ui.menuToggle?.addEventListener('click', () => {
      const next = !ui.sidebar.classList.contains('hidden');
      ui.sidebar.classList.toggle('hidden', next);
      ui.main.classList.toggle('full', next);
      localStorage.setItem(MENU_KEY, String(next));
    });
ui.themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
  syncMenuTheme();
});
    ui.openDataFolderBtn?.addEventListener('click', async () => {
      await chooseDataFolder();
      await applyFolderStatus(ui);
      await updateFooter(ui);
    });
    const currentYear = localStorage.getItem(PAGE_YEAR_KEY) || String(new Date().getFullYear());
    if (ui.yearSelect && !ui.yearSelect.options.length) ui.yearSelect.innerHTML = `<option value="${currentYear}">${currentYear}</option>`;
    if (ui.yearSelect) {
      ui.yearSelect.value = currentYear;
      ui.yearSelect.addEventListener('change', () => {
        localStorage.setItem(PAGE_YEAR_KEY, ui.yearSelect.value);
        updateFooter(ui);
        window.dispatchEvent(new CustomEvent('acrd:year-changed'));
      });
    }
    applyFolderStatus(ui);
	syncMenuTheme();
    updateFooter(ui);
    return {
      ...ui,
      get year() { return ui.yearSelect ? ui.yearSelect.value : 'Todos'; },
      setYearOptions(years) {
        if (!ui.yearSelect) return;
        const selected = localStorage.getItem(PAGE_YEAR_KEY) || String(new Date().getFullYear());
        const vals = ['Todos', ...[...new Set(years.map(String).filter(Boolean))].sort((a,b)=>Number(b)-Number(a))];
        ui.yearSelect.innerHTML = vals.map(y => `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join('');
        ui.yearSelect.value = vals.includes(selected) ? selected : vals[0];
      }
    };
  }
  function openPrint(url, context) {
    window.__ACRD_PRINT_CONTEXT__ = context;
    window.open(url, '_blank');
  }
  
function bindCrudPage(config) {
  const ui = wireCommon(config.pageKey, { searchPlaceholder: config.searchPlaceholder || 'Pesquisar...' });
  let rows = [];
  const state = { sortKey: config.defaultSort || (config.columns[0]?.key || 'id'), sortDir: 'asc', editId: null };
  const els = {
    tableBody: document.getElementById('tableBody'),
    empty: document.getElementById('emptyState'),
    drawer: document.getElementById('drawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    saveNewBtn: document.getElementById('saveNewBtn'),
    cancelNewBtn: document.getElementById('cancelNewBtn'),
    saveEditBtn: document.getElementById('saveEditBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    deleteEditBtn: document.getElementById('deleteEditBtn')
  };
  function bindSelects(prefix, row={}) {
    (config.fields || []).filter(f => f.type === 'select').forEach(f => {
      const el = document.getElementById(`${prefix}_${f.key}`);
      if (!el) return;
      const options = typeof f.options === 'function' ? f.options() : (f.options || []);
      el.innerHTML = options.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');
      el.value = row[f.key] ?? (typeof f.defaultValue === 'function' ? f.defaultValue() : (f.defaultValue ?? options[0]?.value ?? ''));
    });
  }
  function resetForm() {
    (config.fields || []).forEach(f => {
      const el = document.getElementById(`new_${f.key}`);
      if (!el) return;
      if (f.type === 'select') return;
      if (typeof f.defaultValue === 'function') el.value = f.defaultValue();
      else el.value = f.defaultValue ?? '';
    });
    bindSelects('new');
  }
  function filterRows() {
    let out = [...rows];
    if (config.yearField && ui.year !== 'Todos') out = out.filter(r => String(r[config.yearField]) === String(ui.year));
    const q = ui.search?.value.trim().toLowerCase() || '';
    if (q) out = out.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    return sortRows(out, state.sortKey, state.sortDir);
  }
  function renderTable() {
    if (config.yearField) ui.setYearOptions([...new Set(rows.map(r => String(r[config.yearField] || '')).filter(Boolean))]);
    const out = filterRows();
    els.tableBody.innerHTML = out.map(r => `<tr class="${config.rowClass ? (config.rowClass(r) || '') : ''}">${config.columns.map(c => `<td class="${c.className || ''}">${c.render ? c.render(r) : escapeHtml(r[c.key])}</td>`).join('')}<td><div class="actions-row"><button class="action-btn" data-edit="${r.id}">Editar</button></div></td></tr>`).join('');
    els.empty.hidden = out.length !== 0;
    document.querySelectorAll('th[data-key]').forEach(th => {
      th.classList.toggle('sorted', th.dataset.key === state.sortKey);
      th.onclick = () => {
        if (state.sortKey === th.dataset.key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = th.dataset.key; state.sortDir = 'asc'; }
        renderTable();
      };
    });
    document.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openDrawer(btn.dataset.edit));
  }
  function collect(prefix, current={}) {
    const obj = { ...current };
    (config.fields || []).forEach(f => {
      const el = document.getElementById(`${prefix}_${f.key}`);
      if (!el) return;
      let value = f.type === 'checkbox' ? !!el.checked : el.value;
      if (f.type === 'number') value = Number(value || 0);
      obj[f.key] = value;
    });
    if (!obj.id) obj.id = uid();
    obj.updated_at = nowISO();
    obj.updated_by = getUser();
    if (!current.id) { obj.created_at = nowISO(); obj.created_by = getUser(); }
    if (config.afterCollect) config.afterCollect(obj);
    return obj;
  }
  async function saveRows() {
    await writeJson(config.fileName, rows);
    window.dispatchEvent(new CustomEvent('acrd:data-updated', { detail: config.fileName }));
    await updateFooter(ui);
  }
  function openDrawer(id) {
    const row = rows.find(r => r.id === id); if (!row) return;
    state.editId = id;
    (config.fields || []).forEach(f => {
      const el = document.getElementById(`edit_${f.key}`);
      if (!el) return;
      if (f.type !== 'select') el.value = row[f.key] ?? '';
    });
    bindSelects('edit', row);
    els.drawer.classList.add('open'); els.drawerBackdrop.classList.add('open');
  }
  function closeDrawer() { state.editId = null; els.drawer.classList.remove('open'); els.drawerBackdrop.classList.remove('open'); }
  async function init() {
    rows = await readJson(config.fileName, config.seed || []);
    resetForm(); renderTable();
    if (config.afterInit) config.afterInit({ ui, getRows: () => rows, setRows: async newRows => { rows = newRows; await saveRows(); renderTable(); }, renderTable });
  }
  ui.search?.addEventListener('input', renderTable);
  window.addEventListener('acrd:year-changed', renderTable);
  window.addEventListener('acrd:data-folder-changed', init);
  els.saveNewBtn?.addEventListener('click', async () => {
    const obj = collect('new');
    const err = config.validate ? config.validate(obj) : '';
    if (err) return alert(err);
    if (!confirmAction('Confirmas guardar este registo?')) return;
    rows.unshift(obj); await saveRows(); resetForm(); renderTable();
  });
  els.cancelNewBtn?.addEventListener('click', resetForm);
  els.saveEditBtn?.addEventListener('click', async () => {
    const idx = rows.findIndex(r => r.id === state.editId); if (idx < 0) return;
    const obj = collect('edit', rows[idx]); const err = config.validate ? config.validate(obj) : '';
    if (err) return alert(err);
    if (!confirmAction('Guardar alterações?')) return;
    rows[idx] = obj; await saveRows(); renderTable(); closeDrawer();
  });
  els.cancelEditBtn?.addEventListener('click', closeDrawer);
  els.deleteEditBtn?.addEventListener('click', async () => {
    if (!state.editId) return; if (!confirmAction('Eliminar registo?')) return;
    rows = rows.filter(r => r.id !== state.editId); await saveRows(); renderTable(); closeDrawer();
  });
  els.drawerBackdrop?.addEventListener('click', closeDrawer);
  init();
}

return {escapeHtml, uid, nowISO, todayISO, getUser, confirmAction, formatEuro, formatDateTime, numberToWordsPt, moneyToWordsPt, dateToWordsPt, sortRows, registerSeed, seed, readJson, writeJson, wireCommon, openPrint, updateFooter, chooseDataFolder, bindCrudPage};
})();

window.App = App;
