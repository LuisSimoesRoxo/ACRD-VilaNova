App.registerSeed('fornecedores.json', [{"id": "f1", "nome": "ACRD VILA NOVA", "nif": "501303383", "telefone": "N.A.", "email": "vilanova.acrd@gmail.com", "morada": "Rua da Escola, 34, 3450-348 Vila Nova, Mortágua", "ativo": true, "observacoes": "Entidade principal", "created_at": "2026-01-01T00:00:00", "created_by": "Sistema", "updated_at": "2026-01-01T00:00:00", "updated_by": "Sistema"}, {"id": "f2", "nome": "EDP", "nif": "N.A.", "telefone": "N.A.", "email": "N.A.", "morada": "N.A.", "ativo": true, "observacoes": "Fornecedor utilidades", "created_at": "2026-01-01T00:00:00", "created_by": "Sistema", "updated_at": "2026-01-01T00:00:00", "updated_by": "Sistema"}, {"id": "f3", "nome": "MEO", "nif": "N.A.", "telefone": "N.A.", "email": "N.A.", "morada": "N.A.", "ativo": true, "observacoes": "Telecomunicações", "created_at": "2026-01-01T00:00:00", "created_by": "Sistema", "updated_at": "2026-01-01T00:00:00", "updated_by": "Sistema"}]);
document.addEventListener('DOMContentLoaded', () => {
  App.bindCrudPage({
    pageKey:'fornecedores',
    fileName:'fornecedores.json',
    seed: App.seed('fornecedores.json'),
    searchPlaceholder:'Pesquisar fornecedor, NIF, telefone ou email',
    yearField:null,
    defaultSort:'nome',
    fields:[{key:'nome',label:'Fornecedor',type:'text'},{key:'nif',label:'NIF',type:'text'},{key:'telefone',label:'Telefone',type:'text'},{key:'email',label:'Email',type:'text'},{key:'morada',label:'Morada',type:'text'},{key:'observacoes',label:'Observações',type:'textarea'}],
    columns:[{key:'nome',label:'Fornecedor'},{key:'nif',label:'NIF'},{key:'telefone',label:'Telefone'},{key:'email',label:'Email'},{key:'morada',label:'Morada'},{key:'updated_by',label:'Alterado por'}],
    validate:(obj)=>!obj.nome?'Nome do fornecedor é obrigatório.':'',
    afterCollect:null
  });
});
