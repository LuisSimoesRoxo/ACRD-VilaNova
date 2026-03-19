App.registerSeed('faturacao.json', [);
App.registerSeed('cod_acrd.json', []);
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('relatorio_funcionamento_geral', { searchPlaceholder:'Pesquisar código' });
  async function render() {
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const cods = await App.readJson('cod_acrd.json', App.seed('cod_acrd.json'));
    ui.setYearOptions([...new Set(fat.map(r=>String(r.ano)).filter(Boolean))]);
    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const rows = cods.map(c=>{ const ref=fat.filter(r=>String(r.ano)===year&&String(r.codigo_acrd_id)===String(c.id)); const receita=ref.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0); const despesa=ref.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0); return {codigo:c.codigo,descricao:c.descricao,receita,despesa,saldo:receita-despesa}; });
    document.getElementById('funcBody').innerHTML = rows.map(r=>`<tr><td>${r.codigo}</td><td>${r.descricao}</td><td class="money">${App.formatEuro(r.receita)}</td><td class="money">${App.formatEuro(r.despesa)}</td><td class="money">${App.formatEuro(r.saldo)}</td></tr>`).join('');
    document.getElementById('printBtn').onclick = () => App.openPrint('prints/print_funcionamento_geral.html', { title:'Funcionamento Geral', rows, year, printedAt: App.nowISO() });
  }
  window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', render); render();
});
