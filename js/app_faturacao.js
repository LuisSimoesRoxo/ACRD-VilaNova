App.registerSeed('faturacao.json', []);
App.registerSeed('eventos_nome.json', []);
App.registerSeed('cod_acrd.json', []);
document.addEventListener('DOMContentLoaded', async () => {
  const ui = App.wireCommon('faturacao', { searchPlaceholder:'Pesquisar por descrição, fatura, fornecedor ou evento' });
  let rows = await App.readJson('faturacao.json', App.seed('faturacao.json'));
  let eventos = await App.readJson('eventos_nome.json', App.seed('eventos_nome.json'));
  let fornecedores = await App.readJson('fornecedores.json', App.seed('fornecedores.json'));
  let cods = await App.readJson('cod_acrd.json', App.seed('cod_acrd.json'));
  let sortKey = 'data', sortDir = 'desc';
  function options(arr, valueKey='id', labelKey='nome') { return arr.map(r=>`<option value="${App.escapeHtml(r[valueKey])}">${App.escapeHtml(r[labelKey])}</option>`).join(''); }
  function bindSelects(prefix, row={}) {
    document.getElementById(`${prefix}_evento_id`).innerHTML = options(eventos);
    document.getElementById(`${prefix}_fornecedor_id`).innerHTML = options(fornecedores);
    document.getElementById(`${prefix}_codigo_acrd_id`).innerHTML = cods.map(c=>`<option value="${App.escapeHtml(c.id)}">${App.escapeHtml(c.codigo)} - ${App.escapeHtml(c.descricao)}</option>`).join('');
    document.getElementById(`${prefix}_origem`).innerHTML = ['CAIXA','CAIXA-BAR','BANCO'].map(v=>`<option value="${v}">${v}</option>`).join('');
    document.getElementById(`${prefix}_tipo`).innerHTML = ['RECEITA','DESPESA'].map(v=>`<option value="${v}">${v}</option>`).join('');
    document.getElementById(`${prefix}_situacao`).innerHTML = ['REGULARIZADO','POR REGULARIZAR'].map(v=>`<option value="${v}">${v}</option>`).join('');
    document.getElementById(`${prefix}_verif_ft`).innerHTML = '<option value="true">Sim</option><option value="false">Não</option>';
    ['evento_id','fornecedor_id','codigo_acrd_id','origem','tipo','situacao','verif_ft'].forEach(k=>{ const el = document.getElementById(`${prefix}_${k}`); if(row[k]!==undefined) el.value = String(row[k]); });
  }
  function resetForm() { document.getElementById('new_data').value = App.todayISO(); document.getElementById('new_numero_fatura').value=''; document.getElementById('new_montante').value=''; document.getElementById('new_descricao').value=''; bindSelects('new'); }
  function getName(arr, id) { return arr.find(x=>String(x.id)===String(id))?.nome || id || 'N.A.'; }
  function getCode(id) { const c = cods.find(x=>String(x.id)===String(id)); return c ? `${c.codigo}.${c.descricao}` : (id || 'N.A.'); }
  function filtered() { let out=[...rows]; if(ui.year!=='Todos') out=out.filter(r=>String(r.ano)===String(ui.year)); const q=ui.search.value.trim().toLowerCase(); if(q) out=out.filter(r=>JSON.stringify(r).toLowerCase().includes(q)); return App.sortRows(out, sortKey, sortDir); }
  function render() {
    ui.setYearOptions([...new Set(rows.map(r=>String(r.ano)).filter(Boolean))]);
    const out = filtered();
    document.getElementById('tableBody').innerHTML = out.map(r=>`<tr class="${String(r.situacao).toUpperCase()==='POR REGULARIZAR'?'row-pending':(r.verif_ft?'row-ok':'')}"><td><input type="checkbox" class="row-select" data-id="${r.id}"></td><td>${r.ano}</td><td>${App.escapeHtml(r.data)}</td><td>${App.escapeHtml(getName(eventos,r.evento_id))}</td><td>${App.escapeHtml(getName(fornecedores,r.fornecedor_id))}</td><td>${App.escapeHtml(r.numero_fatura||'N.A.')}</td><td>${App.escapeHtml(r.origem||'N.A.')}</td><td>${App.escapeHtml(getCode(r.codigo_acrd_id))}</td><td class="${String(r.tipo).toUpperCase()==='RECEITA'?'txt-income':'txt-expense'}">${App.escapeHtml(r.tipo||'N.A.')}</td><td class="money">${App.formatEuro(r.montante)}</td><td>${App.escapeHtml(r.descricao||'N.A.')}</td><td>${App.escapeHtml(r.situacao||'N.A.')}</td><td>${r.verif_ft?'Sim':'Não'}</td><td>${App.escapeHtml(r.updated_by||'N.A.')}</td><td><div class="actions-row"><button class="action-btn" data-edit="${r.id}">Editar</button></div></td></tr>`).join('');
    document.getElementById('emptyState').hidden = out.length !== 0;
    document.querySelectorAll('th[data-key]').forEach(th=>{ th.classList.toggle('sorted', th.dataset.key===sortKey); th.onclick=()=>{ if(sortKey===th.dataset.key) sortDir=sortDir==='asc'?'desc':'asc'; else { sortKey=th.dataset.key; sortDir=th.dataset.key==='data'?'desc':'asc'; } render(); }; });
    document.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openDrawer(btn.dataset.edit));
  }
  function collect(prefix, current={}) {
    const obj = {...current, data:document.getElementById(`${prefix}_data`).value, evento_id:document.getElementById(`${prefix}_evento_id`).value||'N.A.', fornecedor_id:document.getElementById(`${prefix}_fornecedor_id`).value||'N.A.', numero_fatura:document.getElementById(`${prefix}_numero_fatura`).value||'N.A.', origem:document.getElementById(`${prefix}_origem`).value||'N.A.', codigo_acrd_id:document.getElementById(`${prefix}_codigo_acrd_id`).value||'N.A.', tipo:document.getElementById(`${prefix}_tipo`).value||'N.A.', montante:Number(document.getElementById(`${prefix}_montante`).value||0), descricao:document.getElementById(`${prefix}_descricao`).value||'N.A.', situacao:document.getElementById(`${prefix}_situacao`).value||'N.A.', verif_ft:document.getElementById(`${prefix}_verif_ft`).value==='true', updated_at:App.nowISO(), updated_by:App.getUser() };
    obj.ano = obj.data ? Number(String(obj.data).slice(0,4)) : new Date().getFullYear(); if(!obj.id) { obj.id=App.uid(); obj.created_at=App.nowISO(); obj.created_by=App.getUser(); } return obj;
  }
  function validate(obj) { if(!obj.data) return 'Data obrigatória.'; if(Number(obj.montante)<=0) return 'Montante deve ser superior a zero.'; return ''; }
  async function saveRows() { await App.writeJson('faturacao.json', rows); await App.updateFooter(ui); }
  function openDrawer(id) { const row=rows.find(r=>r.id===id); if(!row) return; bindSelects('edit', row); ['data','numero_fatura','montante','descricao'].forEach(k=>document.getElementById(`edit_${k}`).value=row[k]??''); document.getElementById('drawer').dataset.id=id; document.getElementById('drawer').classList.add('open'); document.getElementById('drawerBackdrop').classList.add('open'); }
  function closeDrawer() { document.getElementById('drawer').classList.remove('open'); document.getElementById('drawerBackdrop').classList.remove('open'); delete document.getElementById('drawer').dataset.id; }
  document.getElementById('saveNewBtn').onclick = async ()=>{ const obj=collect('new'); const err=validate(obj); if(err) return alert(err); if(!App.confirmAction('Confirmas guardar este registo?')) return; rows.unshift(obj); await saveRows(); resetForm(); render(); };
  document.getElementById('cancelNewBtn').onclick = resetForm;
  document.getElementById('saveEditBtn').onclick = async ()=>{ const id=document.getElementById('drawer').dataset.id; const idx=rows.findIndex(r=>r.id===id); if(idx<0) return; const obj=collect('edit', rows[idx]); const err=validate(obj); if(err) return alert(err); if(!App.confirmAction('Guardar alterações?')) return; rows[idx]=obj; await saveRows(); render(); closeDrawer(); };
  document.getElementById('cancelEditBtn').onclick = closeDrawer;
  document.getElementById('deleteEditBtn').onclick = async ()=>{ const id=document.getElementById('drawer').dataset.id; if(!id) return; if(!App.confirmAction('Eliminar registo?')) return; rows = rows.filter(r=>r.id!==id); await saveRows(); render(); closeDrawer(); };
  document.getElementById('drawerBackdrop').onclick = closeDrawer;
  document.getElementById('printSelectedBtn').onclick = ()=>{ const ids=[...document.querySelectorAll('.row-select:checked')].map(el=>el.dataset.id); if(!ids.length) return alert('Não existem registos selecionados.'); App.openPrint('prints/print_faturacao.html', { title:'Movimentos selecionados', rows:rows.filter(r=>ids.includes(r.id)), printedAt:App.nowISO(), lookups:{eventos, fornecedores, cods} }); };
  document.getElementById('printFilteredBtn').onclick = ()=>{ const out=filtered(); if(!out.length) return alert('Não existem registos filtrados.'); App.openPrint('prints/print_faturacao.html', { title:'Movimentos filtrados', rows:out, printedAt:App.nowISO(), lookups:{eventos, fornecedores, cods} }); };
  document.getElementById('printAllBtn').onclick = ()=>App.openPrint('prints/print_faturacao.html', { title:'Todos os movimentos', rows, printedAt:App.nowISO(), lookups:{eventos, fornecedores, cods} });
  ui.search.addEventListener('input', render); window.addEventListener('acrd:year-changed', render); window.addEventListener('acrd:data-folder-changed', async ()=>{ rows = await App.readJson('faturacao.json', App.seed('faturacao.json')); eventos = await App.readJson('eventos_nome.json', App.seed('eventos_nome.json')); fornecedores = await App.readJson('fornecedores.json', App.seed('fornecedores.json')); cods = await App.readJson('cod_acrd.json', App.seed('cod_acrd.json')); resetForm(); render(); });
  resetForm(); render();
});
