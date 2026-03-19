App.registerSeed('dados_bancarios.json', []);
App.registerSeed('faturacao.json', []);
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('relatorio_balanco', { searchPlaceholder:'Pesquisar ano' });
  async function render() {
    const banks = await App.readJson('dados_bancarios.json', App.seed('dados_bancarios.json'));
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    ui.setYearOptions([...new Set([...banks.map(r=>String(r.ano)), ...fat.map(r=>String(r.ano))].filter(Boolean))]);
    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const bank = banks.find(r=>String(r.ano)===year) || {saldo_banco:0,saldo_caixa:0,saldo_total:0,data_banco:'N.A.',data_caixa:'N.A.'};
    const rows = fat.filter(r=>String(r.ano)===year);
    const receita = rows.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0);
    const despesa = rows.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0);
    const saldo = receita - despesa;
    document.getElementById('balancoContent').innerHTML = `<table class="data-table"><tbody><tr><th>DEPÓSITO À ORDEM</th><td>${bank.data_banco||'N.A.'}</td><td class="money">${App.formatEuro(bank.saldo_banco||0)}</td></tr><tr><th>CAIXA</th><td>${bank.data_caixa||'N.A.'}</td><td class="money">${App.formatEuro(bank.saldo_caixa||0)}</td></tr><tr><th>SALDO CONTABILÍSTICO</th><td></td><td class="money">${App.formatEuro(bank.saldo_total||0)}</td></tr><tr><th>RECEITAS</th><td>${year}</td><td class="money">${App.formatEuro(receita)}</td></tr><tr><th>DESPESAS</th><td>${year}</td><td class="money">${App.formatEuro(despesa)}</td></tr><tr><th>SALDO DO EXERCÍCIO</th><td>${year}</td><td class="money">${App.formatEuro(saldo)}</td></tr></tbody></table>`;
    document.getElementById('printBtn').onclick = () => App.openPrint('prints/print_balanco.html', { title:'Balanço', year, bank, receita, despesa, saldo, printedAt: App.nowISO() });
  }
  window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', render); render();
});
