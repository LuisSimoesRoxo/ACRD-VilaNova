App.registerSeed('precario.json', [{"id": "p1", "data": "2026-01-01", "nome_produto": "Cerveja", "categoria": "Bar", "valor": 1.5, "ativo": true, "ordem": 1, "created_at": "2026-01-01T00:00:00", "created_by": "Sistema", "updated_at": "2026-01-01T00:00:00", "updated_by": "Sistema"}]);
document.addEventListener('DOMContentLoaded', () => {
  App.bindCrudPage({
    pageKey:'precarios',
    fileName:'precario.json',
    seed: App.seed('precario.json'),
    searchPlaceholder:'Pesquisar produto',
    yearField:"ano",
    defaultSort:'ordem',
    fields:[{key:'data',label:'Data',type:'date',defaultValue:()=>App.todayISO()},{key:'nome_produto',label:'Produto',type:'text'},{key:'categoria',label:'Categoria',type:'text'},{key:'valor',label:'Valor (€)',type:'number'},{key:'ativo',label:'Ativo',type:'select',options:[{value:'true',label:'Sim'},{value:'false',label:'Não'}],defaultValue:'true'},{key:'ordem',label:'Ordem',type:'number'}],
    columns:[{key:'data',label:'Data'},{key:'nome_produto',label:'Produto'},{key:'categoria',label:'Categoria'},{key:'valor',label:'Valor',className:'money',render:(r)=>App.formatEuro(r.valor)},{key:'ativo',label:'Ativo',render:(r)=>r.ativo?'Sim':'Não'},{key:'updated_by',label:'Alterado por'}],
    validate:(obj)=>!obj.nome_produto?'Nome do produto obrigatório.':'',
    afterCollect:(obj)=>{ obj.ativo=String(obj.ativo)==='true'; obj.ano=obj.data?String(new Date(obj.data).getFullYear()):'N.A.'; obj.ordem=Number(obj.ordem||0); }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('printPageBtn');
  if (btn) btn.addEventListener('click', async () => {
    const rows = await App.readJson('precario.json', App.seed('precario.json'));
    App.openPrint('prints/print_precarios.html', { title:'Preçário', rows, printedAt: App.nowISO() });
  });
});