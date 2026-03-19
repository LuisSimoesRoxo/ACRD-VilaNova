App.registerSeed('eventos_nome.json', []);
document.addEventListener('DOMContentLoaded', () => {
  App.bindCrudPage({
    pageKey:'eventos_nome',
    fileName:'eventos_nome.json',
    seed: App.seed('eventos_nome.json'),
    searchPlaceholder:'Pesquisar evento',
    yearField:"ano",
    defaultSort:'data_evento',
    fields:[{key:'nome',label:'Nome do evento',type:'text'},{key:'data_evento',label:'Data do evento',type:'date',defaultValue:()=>App.todayISO()},{key:'tipo_evento',label:'Tipo de evento',type:'text'},{key:'estado',label:'Estado',type:'select',options:[{value:'Planeado',label:'Planeado'},{value:'Ativo',label:'Ativo'},{value:'Concluído',label:'Concluído'},{value:'Cancelado',label:'Cancelado'}],defaultValue:'Planeado'},{key:'ativo',label:'Ativo',type:'select',options:[{value:'true',label:'Sim'},{value:'false',label:'Não'}],defaultValue:'true'}],
    columns:[{key:'nome',label:'Evento'},{key:'data_evento',label:'Data'},{key:'tipo_evento',label:'Tipo'},{key:'estado',label:'Estado'},{key:'ativo',label:'Ativo',render:(r)=>r.ativo?'Sim':'Não'},{key:'updated_by',label:'Alterado por'}],
    validate:(obj)=>!obj.nome?'Nome do evento obrigatório.':'',
    afterCollect:(obj)=>{ obj.ativo=String(obj.ativo)==='true'; obj.ano=obj.data_evento?String(new Date(obj.data_evento).getFullYear()):'N.A.'; }
  });
});
