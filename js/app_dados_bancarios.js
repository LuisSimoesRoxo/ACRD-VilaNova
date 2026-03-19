App.registerSeed('dados_bancarios.json', [{"id": "db-2023", "ano": "2023", "data_registo": "2023-12-31", "saldo_banco": 21062.24, "data_banco": "2023-12-31", "saldo_caixa": 1830.0, "data_caixa": "2023-12-31", "saldo_total": 22892.24, "created_at": "N.A.", "created_by": "N.A.", "updated_at": "N.A.", "updated_by": "N.A."}, {"id": "db-2024", "ano": "2024", "data_registo": "2024-12-31", "saldo_banco": 23456.83, "data_banco": "2024-12-31", "saldo_caixa": 878.75, "data_caixa": "2024-12-31", "saldo_total": 24335.58, "created_at": "N.A.", "created_by": "N.A.", "updated_at": "N.A.", "updated_by": "N.A."}, {"id": "db-2025", "ano": "2025", "data_registo": "2025-12-31", "saldo_banco": 24629.6, "data_banco": "2025-12-31", "saldo_caixa": 1241.39, "data_caixa": "2025-12-31", "saldo_total": 25870.99, "created_at": "N.A.", "created_by": "N.A.", "updated_at": "N.A.", "updated_by": "N.A."}, {"id": "db-2026", "ano": "2026", "data_registo": "2026-01-01", "saldo_banco": 30104.71, "data_banco": "2026-01-01", "saldo_caixa": 265.79, "data_caixa": "2026-01-01", "saldo_total": 30370.5, "created_at": "N.A.", "created_by": "N.A.", "updated_at": "N.A.", "updated_by": "N.A."}]);
document.addEventListener('DOMContentLoaded', () => {
  App.bindCrudPage({
    pageKey:'dados_bancarios',
    fileName:'dados_bancarios.json',
    seed: App.seed('dados_bancarios.json'),
    searchPlaceholder:'Pesquisar por ano ou utilizador',
    yearField:"ano",
    defaultSort:'ano',
    fields:[{key:'ano',label:'Ano',type:'number',defaultValue:()=>String(new Date().getFullYear())},{key:'data_registo',label:'Data registo',type:'date',defaultValue:()=>App.todayISO()},{key:'saldo_banco',label:'Banco (€)',type:'number'},{key:'data_banco',label:'Data banco',type:'date',defaultValue:()=>App.todayISO()},{key:'saldo_caixa',label:'Caixa (€)',type:'number'},{key:'data_caixa',label:'Data caixa',type:'date',defaultValue:()=>App.todayISO()}],
    columns:[{key:'ano',label:'Ano'},{key:'data_registo',label:'Data registo'},{key:'saldo_banco',label:'Banco',className:'money',render:(r)=>App.formatEuro(r.saldo_banco)},{key:'data_banco',label:'Data banco'},{key:'saldo_caixa',label:'Caixa',className:'money',render:(r)=>App.formatEuro(r.saldo_caixa)},{key:'data_caixa',label:'Data caixa'},{key:'saldo_total',label:'Saldo',className:'money',render:(r)=>App.formatEuro(r.saldo_total)},{key:'updated_by',label:'Alterado por'}],
    validate:(obj)=>!obj.ano?'Ano obrigatório.':(!obj.data_banco||!obj.data_caixa?'Datas obrigatórias.':''),
    afterCollect:(obj)=>{ obj.ano=String(obj.ano); obj.saldo_total=Number(obj.saldo_banco||0)+Number(obj.saldo_caixa||0); }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('printPageBtn');
  if (btn) btn.addEventListener('click', async () => {
    const rows = await App.readJson('dados_bancarios.json', App.seed('dados_bancarios.json'));
    App.openPrint('prints/print_dados_bancarios.html', { title:'Dados Bancários', rows, printedAt: App.nowISO() });
  });
});