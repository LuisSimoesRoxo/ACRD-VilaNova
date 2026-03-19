App.registerSeed('tabelas_aux.json', []);
document.addEventListener('DOMContentLoaded', () => {
  App.bindCrudPage({
    pageKey:'tabelas_aux',
    fileName:'tabelas_aux.json',
    seed: App.seed('tabelas_aux.json'),
    searchPlaceholder:'Pesquisar variável ou valor',
    yearField:"ano",
    defaultSort:'nome',
    fields:[{key:'data',label:'Data',type:'date',defaultValue:()=>App.todayISO()},{key:'nome',label:'Nome da variável',type:'text'},{key:'valor',label:'Valor',type:'textarea'}],
    columns:[{key:'data',label:'Data'},{key:'nome',label:'Nome'},{key:'valor',label:'Valor'},{key:'updated_by',label:'Alterado por'}],
    validate:(obj)=>!obj.nome?'Nome obrigatório.':'',
    afterCollect:(obj)=>{ obj.ano=obj.data?String(new Date(obj.data).getFullYear()):'N.A.'; }
  });
});
