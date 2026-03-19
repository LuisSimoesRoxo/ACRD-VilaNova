App.registerSeed('fornecedores.json', []);
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
