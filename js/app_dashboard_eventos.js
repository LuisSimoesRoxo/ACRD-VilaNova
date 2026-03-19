App.registerSeed('faturacao.json', []);
App.registerSeed('eventos_nome.json', []);
App.registerSeed('eventos_participantes.json', []);
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('dashboard_eventos', { searchPlaceholder:'Pesquisar evento' });
  let sortKey='nome', sortDir='asc';
  async function render() {
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const eventos = await App.readJson('eventos_nome.json', App.seed('eventos_nome.json'));
    const part = await App.readJson('eventos_participantes.json', App.seed('eventos_participantes.json'));
    ui.setYearOptions([...new Set(fat.map(r=>String(r.ano)).filter(Boolean))]);
    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const q = ui.search.value.trim().toLowerCase();
    const rows = eventos.filter(e=>!e.data_evento||String(new Date(e.data_evento).getFullYear())===year).map(e=>{ const ref = fat.filter(r=>String(r.ano)===year && String(r.evento_id)===String(e.id)); const receita = ref.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0); const despesa = ref.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0); const inscritos = part.filter(p=>String(p.evento_id)===String(e.id)).length; return {nome:e.nome,receita,despesa,saldo:receita-despesa,inscritos}; }).filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));
    const sorted = App.sortRows(rows, sortKey, sortDir);
    document.getElementById('dashboardEventosBody').innerHTML = sorted.map(r=>`<tr><td>${App.escapeHtml(r.nome)}</td><td class="money">${App.formatEuro(r.receita)}</td><td class="money">${App.formatEuro(r.despesa)}</td><td class="money">${App.formatEuro(r.saldo)}</td><td>${r.inscritos}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Sem dados.</td></tr>';
    document.querySelectorAll('th[data-key]').forEach(th=>{ th.classList.toggle('sorted', th.dataset.key===sortKey); th.onclick=()=>{ if(sortKey===th.dataset.key) sortDir = sortDir==='asc'?'desc':'asc'; else { sortKey=th.dataset.key; sortDir='asc'; } render(); }; });
  }
  ui.search.addEventListener('input', render); window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', render); render();
});
