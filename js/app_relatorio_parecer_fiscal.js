App.registerSeed('tabelas_aux.json', []);
App.registerSeed('dados_bancarios.json', []);
App.registerSeed('faturacao.json', []);
App.registerSeed('app_config.json', {"nome_associacao": "Associação Cultural Recreativa e Desportiva de Vila Nova", "nome_curto": "ACRD Vila Nova", "morada": "Rua da Escola, 34, 3450-348 Vila Nova, Mortágua", "contribuinte": "501303383", "email": "vilanova.acrd@gmail.com", "facebook": "www.facebook.com/acrdvilanova/", "logotipo": "assets/logo.png", "tema_predefinido": "light"});
document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('relatorio_parecer_fiscal', { searchPlaceholder:'Pesquisar ano' });
  async function render() {
    const banks = await App.readJson('dados_bancarios.json', App.seed('dados_bancarios.json'));
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const cfg = await App.readJson('app_config.json', App.seed('app_config.json'));
   
const aux = await App.readJson('tabelas_aux.json', App.seed('tabelas_aux.json'));

const presidente = aux.find(r => r.nome === 'assinatura_presidente')?.valor || '____________________________';
const secretario = aux.find(r => r.nome === 'assinatura_secretario')?.valor || '____________________________';
const relator = aux.find(r => r.nome === 'assinatura_relator')?.valor || '____________________________';
   
    ui.setYearOptions([...new Set([...banks.map(r=>String(r.ano)), ...fat.map(r=>String(r.ano))].filter(Boolean))]);
    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const today = App.todayISO();
    const rows = fat.filter(r=>String(r.ano)===year);
    const receita = rows.filter(r=>String(r.tipo).toUpperCase()==='RECEITA').reduce((s,r)=>s+Number(r.montante||0),0);
    const despesa = rows.filter(r=>String(r.tipo).toUpperCase()==='DESPESA').reduce((s,r)=>s+Number(r.montante||0),0);
    const saldo = receita - despesa;
    const bank = banks.find(r=>String(r.ano)===year) || {saldo_banco:0,saldo_caixa:0,saldo_total:0};
const saldoTipo =
  Number(saldo) > 0 ? 'positivo' :
  Number(saldo) < 0 ? 'negativo' :
  'neutro';
    const texto = `Aos ${App.dateToWordsPt(today)}, reuniu o Conselho Fiscal, na sede da Associação Cultural, Recreativa e Desportiva de Vila Nova, a fim de analisar o relatório e contas relativo ao ano de ${App.numberToWordsPt(Number(year))}.\n\nEstiveram presentes todos os elementos deste órgão.--------------\n\nApós verificarem o relatório de atividades e as respetivas contas, assim como elementos de suporte, verificaram o seguinte:--------------\n\nNo ano de ${App.numberToWordsPt(Number(year))}, as receitas foram de ${App.formatEuro(receita)} (${App.moneyToWordsPt(receita)}) e as despesas foram de ${App.formatEuro(despesa)} (${App.moneyToWordsPt(despesa)}), resultando num saldo ${saldoTipo} de ${App.formatEuro(saldo)} (${App.moneyToWordsPt(saldo)}).--------------\n\nConferiu-se que o saldo financeiro da Associação a transportar para o ano de ${App.numberToWordsPt(new Date().getFullYear() + 1)} é de ${App.formatEuro(bank.saldo_total || 0)} (${App.moneyToWordsPt(bank.saldo_total || 0)}), sendo ${App.formatEuro(bank.saldo_banco || 0)} (${App.moneyToWordsPt(bank.saldo_banco || 0)}) em depósitos à ordem e ${App.formatEuro(bank.saldo_caixa || 0)} (${App.moneyToWordsPt(bank.saldo_caixa || 0)}) em caixa.--------------\n\nApós análise, verificou-se que as contas estão em devida ordem, bem organizadas e de fácil conferência.--------------\n\nPelas razões acima transcritas, emitiu o seguinte Parecer: fosse aprovado o Relatório de Atividades e Contas e que fosse dado um voto de louvor pelos bons serviços desempenhados pela atual Direção.--------------`;
    document.getElementById('parecerTexto').textContent = texto;
    document.getElementById('printBtn').onclick = () => App.openPrint('prints/print_parecer_fiscal.html', { title:'Parecer do Conselho Fiscal', texto, year, printedAt: App.nowISO(), cfg });
  }
  window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', render); render();
});
