App.registerSeed('faturacao.json', []);
App.registerSeed('fornecedores.json', []);
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('dashboard_fornecedores', { searchPlaceholder:'Pesquisar fornecedor' });
  let sortKey='nome', sortDir='asc';
  async function render() {
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const forn = await App.readJson('fornecedores.json', App.seed('fornecedores.json'));
    ui.setYearOptions([...new Set(fat.map(r=>String(r.ano)).filter(Boolean))]);
    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const q = ui.search.value.trim().toLowerCase();
    const rows = forn.map(f=>{ const ref = fat.filter(r=>String(r.ano)===year && String(r.fornecedor_id)===String(f.id)); const receita = ref.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0); const despesa = ref.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0); const ultimo = [...ref].sort((a,b)=>String(b.data).localeCompare(String(a.data)))[0]?.data || 'N.A.'; return {nome:f.nome,movimentos:ref.length,receita,despesa,ultimo}; }).filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));
    const sorted = App.sortRows(rows, sortKey, sortDir);
    document.getElementById('dashboardFornecedoresBody').innerHTML = sorted.map(r=>`<tr><td>${App.escapeHtml(r.nome)}</td><td>${r.movimentos}</td><td class="money">${App.formatEuro(r.receita)}</td><td class="money">${App.formatEuro(r.despesa)}</td><td>${App.escapeHtml(r.ultimo)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Sem dados.</td></tr>';
    document.querySelectorAll('th[data-key]').forEach(th=>{ th.classList.toggle('sorted', th.dataset.key===sortKey); th.onclick=()=>{ if(sortKey===th.dataset.key) sortDir = sortDir==='asc'?'desc':'asc'; else { sortKey=th.dataset.key; sortDir='asc'; } render(); }; });
  }
  ui.search.addEventListener('input', render); window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', render); render();
});
