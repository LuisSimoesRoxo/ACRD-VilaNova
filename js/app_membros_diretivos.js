App.registerSeed('membros_diretivos.json', [{"id": "md-001", "data": "2026-01-05", "nome": "Ângelo Custódio Ferreira Martins", "cargo": "Presidente", "n_nif": "123456789", "n_cc_bi": "12345678", "dt_validade_cc_bi": "2030-05-12", "email": "angelo@example.com", "ativo": true, "created_at": "2026-01-05T10:00:00", "created_by": "Roxo", "updated_at": "2026-01-05T10:00:00", "updated_by": "Roxo"}]);
document.addEventListener('DOMContentLoaded', () => {
  App.bindCrudPage({
    pageKey:'membros_diretivos',
    fileName:'membros_diretivos.json',
    seed: App.seed('membros_diretivos.json'),
    searchPlaceholder:'Pesquisar por nome, cargo, NIF, CC/BI ou email',
    yearField:"ano",
    defaultSort:'nome',
    fields:[{key:'data',label:'Data',type:'date',defaultValue:()=>App.todayISO()},{key:'nome',label:'Nome',type:'text'},{key:'cargo',label:'Cargo',type:'text'},{key:'n_nif',label:'NIF',type:'text'},{key:'n_cc_bi',label:'CC / BI',type:'text'},{key:'dt_validade_cc_bi',label:'Validade CC / BI',type:'date',defaultValue:()=>App.todayISO()},{key:'email',label:'Email',type:'text'},{key:'ativo',label:'Ativo',type:'select',options:[{value:'true',label:'Sim'},{value:'false',label:'Não'}],defaultValue:'true'}],
    columns:[{key:'data',label:'Data'},{key:'nome',label:'Nome'},{key:'cargo',label:'Cargo'},{key:'n_nif',label:'NIF'},{key:'n_cc_bi',label:'CC / BI'},{key:'dt_validade_cc_bi',label:'Validade CC / BI'},{key:'email',label:'Email'},{key:'ativo',label:'Ativo',render:(r)=>r.ativo?'Sim':'Não'},{key:'updated_by',label:'Alterado por'}],
    validate:(obj)=>!obj.nome?'Nome obrigatório.':(!obj.cargo?'Cargo obrigatório.':((obj.n_nif&&!/^\\d{9}$/.test(obj.n_nif))?'O NIF deve ter 9 dígitos.':'')),
    afterCollect:(obj)=>{ obj.ativo=String(obj.ativo)==='true'; obj.ano=obj.data?String(new Date(obj.data).getFullYear()):'N.A.'; }
  });
});
