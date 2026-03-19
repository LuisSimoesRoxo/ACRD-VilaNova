App.registerSeed('dados_bancarios.json', []);
App.registerSeed('faturacao.json', []);
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('relatorio_trienio', { searchPlaceholder:'Pesquisar ano' });
  async function render() {
    const banks = await App.readJson('dados_bancarios.json', App.seed('dados_bancarios.json'));
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const years = [...new Set(banks.map(r=>String(r.ano)).filter(Boolean))].sort((a,b)=>Number(a)-Number(b));
    ui.setYearOptions(years);
    const rows = years.map(y => { const b=banks.find(r=>String(r.ano)===String(y))||{saldo_banco:0,saldo_caixa:0,saldo_total:0}; const fr = fat.filter(r=>String(r.ano)===String(y)); const receita = fr.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0); const despesa = fr.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0); return {ano:y,banco:Number(b.saldo_banco||0),caixa:Number(b.saldo_caixa||0),total:Number(b.saldo_total||0),receita,despesa,saldo:receita-despesa}; });
    document.getElementById('trienioBody').innerHTML = rows.map(r=>`<tr><td>${r.ano}</td><td class="money">${App.formatEuro(r.banco)}</td><td class="money">${App.formatEuro(r.caixa)}</td><td class="money">${App.formatEuro(r.total)}</td><td class="money">${App.formatEuro(r.receita)}</td><td class="money">${App.formatEuro(r.despesa)}</td><td class="money">${App.formatEuro(r.saldo)}</td></tr>`).join('');
    if (rows.length) { const first=rows[0], last=rows[rows.length-1]; document.getElementById('trienioSummary').innerHTML = `<div><strong>Início:</strong> ${App.formatEuro(first.total)} | <strong>Fim:</strong> ${App.formatEuro(last.total)} | <strong>Diferença:</strong> ${App.formatEuro(last.total-first.total)}</div>`; }
    document.getElementById('printBtn').onclick = () => App.openPrint('prints/print_relatorio_trienio.html', { title:'Relatório Triénio', rows, printedAt: App.nowISO() });
  }
  window.addEventListener('acrd:data-folder-changed', render); render();
});
