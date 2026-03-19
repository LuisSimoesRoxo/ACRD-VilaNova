App.registerSeed('dados_bancarios.json', []);
App.registerSeed('app_config.json', , []);
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('relatorio_parecer_fiscal', { searchPlaceholder:'Pesquisar ano' });
  async function render() {
    const banks = await App.readJson('dados_bancarios.json', App.seed('dados_bancarios.json'));
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const cfg = await App.readJson('app_config.json', App.seed('app_config.json'));
    ui.setYearOptions([...new Set([...banks.map(r=>String(r.ano)), ...fat.map(r=>String(r.ano))].filter(Boolean))]);
    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const today = App.todayISO();
    const rows = fat.filter(r=>String(r.ano)===year);
    const receita = rows.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0);
    const despesa = rows.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0);
    const saldo = receita - despesa;
    const bank = banks.find(r=>String(r.ano)===year) || {saldo_banco:0,saldo_caixa:0,saldo_total:0};
    const texto = `Aos ${App.dateToWordsPt(today)}, reuniu o Conselho Fiscal, na sede da Associação Cultural, Recreativa e Desportiva de Vila Nova, a fim de analisar o relatório e contas relativo ao ano de ${App.numberToWordsPt(Number(year))}.\n\nNo ano de ${year}, as receitas foram de ${App.formatEuro(receita)} (${App.moneyToWordsPt(receita)}) e as despesas foram de ${App.formatEuro(despesa)} (${App.moneyToWordsPt(despesa)}), resultando num saldo de ${App.formatEuro(saldo)} (${App.moneyToWordsPt(saldo)}).\n\nConferiu-se que o saldo financeiro da Associação a transportar é de ${App.formatEuro(bank.saldo_total || 0)} (${App.moneyToWordsPt(bank.saldo_total || 0)}), sendo ${App.formatEuro(bank.saldo_banco || 0)} em depósitos à ordem e ${App.formatEuro(bank.saldo_caixa || 0)} em caixa.\n\nApós análise, verificou-se que as contas estão em ordem e de fácil conferência.\n\nParecer: aprovação do Relatório de Atividades e Contas e voto de louvor à Direção.`;
    document.getElementById('parecerTexto').textContent = texto;
    document.getElementById('printBtn').onclick = () => App.openPrint('prints/print_parecer_fiscal.html', { title:'Parecer do Conselho Fiscal', texto, year, printedAt: App.nowISO(), cfg });
  }
  window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', render); render();
});
