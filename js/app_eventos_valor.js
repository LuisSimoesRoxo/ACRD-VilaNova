App.registerSeed('eventos_nome.json', []);
App.registerSeed('eventos_valor.json', []);
App.registerSeed('eventos_participantes.json', []);
App.registerSeed('eventos_caixa.json', []);
document.addEventListener('DOMContentLoaded', async () => {
  const ui = App.wireCommon('eventos_valor', { searchPlaceholder:'Pesquisar participante ou movimento de caixa' });
  let eventos = await App.readJson('eventos_nome.json', App.seed('eventos_nome.json'));
  let valores = await App.readJson('eventos_valor.json', App.seed('eventos_valor.json'));
  let participantes = await App.readJson('eventos_participantes.json', App.seed('eventos_participantes.json'));
  let caixa = await App.readJson('eventos_caixa.json', App.seed('eventos_caixa.json'));
  const wEvento = document.getElementById('work_evento_id');
  function bindOptions() {
    wEvento.innerHTML = eventos.map(e=>`<option value="${App.escapeHtml(e.id)}">${App.escapeHtml(e.nome)}</option>`).join('');
    document.getElementById('part_categoria').innerHTML = ['SOCIO','NAO_SOCIO','MENOR','MENOR_PAGANTE'].map(v=>`<option value="${v}">${v}</option>`).join('');
    document.getElementById('part_pago').innerHTML = '<option value="true">Sim</option><option value="false">Não</option>';
    document.getElementById('cash_tipo').innerHTML = ['ABERTURA','ENTRADA','SAIDA','FECHO'].map(v=>`<option value="${v}">${v}</option>`).join('');
    if (!document.getElementById('cash_data').value) document.getElementById('cash_data').value = App.todayISO();
  }
  function currentId() { return wEvento.value || eventos[0]?.id || ''; }
  async function save(name, rows) { await App.writeJson(name, rows); }
  function render() {
    ui.setYearOptions([...new Set(eventos.map(e=>e.data_evento?String(new Date(e.data_evento).getFullYear()):'').filter(Boolean))]);
    const eid = currentId();
    const val = valores.find(v=>String(v.evento_id)===String(eid)) || { preco_socio:0, preco_nao_socio:0, preco_menor:0, preco_menor_pagante:0 };
    document.getElementById('work_preco_socio').value = val.preco_socio || 0;
    document.getElementById('work_preco_nao_socio').value = val.preco_nao_socio || 0;
    document.getElementById('work_preco_menor').value = val.preco_menor || 0;
    document.getElementById('work_preco_menor_pagante').value = val.preco_menor_pagante || 0;
    const q = ui.search.value.trim().toLowerCase();
    const parts = participantes.filter(p=>String(p.evento_id)===String(eid)).filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));
    const cash = caixa.filter(c=>String(c.evento_id)===String(eid)).filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));
    document.getElementById('partsBody').innerHTML = parts.map(r=>`<tr><td>${App.escapeHtml(r.nome)}</td><td>${App.escapeHtml(r.categoria_participante)}</td><td>${r.pago?'Sim':'Não'}</td><td class="money">${App.formatEuro(r.valor_pago)}</td><td><button class="action-btn warn" data-del-part="${r.id}">Eliminar</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Sem participantes.</td></tr>';
    document.getElementById('cashBody').innerHTML = cash.map(r=>`<tr><td>${App.escapeHtml(r.data)}</td><td>${App.escapeHtml(r.tipo_movimento)}</td><td>${App.escapeHtml(r.descricao)}</td><td class="money">${App.formatEuro(r.valor)}</td><td><button class="action-btn warn" data-del-cash="${r.id}">Eliminar</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Sem movimentos.</td></tr>';
    document.querySelectorAll('[data-del-part]').forEach(btn => btn.onclick = async ()=>{ participantes = participantes.filter(p=>p.id!==btn.dataset.delPart); await save('eventos_participantes.json', participantes); render(); });
    document.querySelectorAll('[data-del-cash]').forEach(btn => btn.onclick = async ()=>{ caixa = caixa.filter(c=>c.id!==btn.dataset.delCash); await save('eventos_caixa.json', caixa); render(); });
    document.getElementById('sumInscritos').textContent = parts.length;
    document.getElementById('sumPagantes').textContent = parts.filter(p=>p.pago).length;
    document.getElementById('sumRecebido').textContent = App.formatEuro(parts.reduce((s,p)=>s+Number(p.valor_pago||0),0));
    const caixaLiquida = cash.reduce((s,c)=>s + (String(c.tipo_movimento).toUpperCase()==='SAIDA' ? -Number(c.valor||0) : Number(c.valor||0)), 0);
    document.getElementById('sumCaixa').textContent = App.formatEuro(caixaLiquida);
  }
  document.getElementById('saveValoresBtn').onclick = async ()=>{ let row = valores.find(v=>String(v.evento_id)===String(currentId())); if(!row) { row={id:App.uid(), evento_id:currentId(), created_at:App.nowISO(), created_by:App.getUser()}; valores.unshift(row); } row.preco_socio=Number(document.getElementById('work_preco_socio').value||0); row.preco_nao_socio=Number(document.getElementById('work_preco_nao_socio').value||0); row.preco_menor=Number(document.getElementById('work_preco_menor').value||0); row.preco_menor_pagante=Number(document.getElementById('work_preco_menor_pagante').value||0); row.updated_at=App.nowISO(); row.updated_by=App.getUser(); await save('eventos_valor.json', valores); render(); };
  document.getElementById('addPartBtn').onclick = async ()=>{ const nome=document.getElementById('part_nome').value.trim(); if(!nome) return alert('Nome obrigatório.'); participantes.unshift({id:App.uid(), evento_id:currentId(), nome, categoria_participante:document.getElementById('part_categoria').value, pago:document.getElementById('part_pago').value==='true', valor_pago:Number(document.getElementById('part_valor').value||0), observacoes:document.getElementById('part_obs').value||'N.A.', created_at:App.nowISO(), created_by:App.getUser(), updated_at:App.nowISO(), updated_by:App.getUser()}); await save('eventos_participantes.json', participantes); document.getElementById('part_nome').value=''; document.getElementById('part_valor').value=''; document.getElementById('part_obs').value=''; render(); };
  document.getElementById('addCashBtn').onclick = async ()=>{ caixa.unshift({id:App.uid(), evento_id:currentId(), data:document.getElementById('cash_data').value||App.todayISO(), tipo_movimento:document.getElementById('cash_tipo').value, descricao:document.getElementById('cash_desc').value||'N.A.', valor:Number(document.getElementById('cash_valor').value||0), created_at:App.nowISO(), created_by:App.getUser(), updated_at:App.nowISO(), updated_by:App.getUser()}); await save('eventos_caixa.json', caixa); document.getElementById('cash_desc').value=''; document.getElementById('cash_valor').value=''; render(); };
  ui.search.addEventListener('input', render); wEvento.addEventListener('change', render);
  window.addEventListener('acrd:data-folder-changed', async ()=>{ eventos=await App.readJson('eventos_nome.json', App.seed('eventos_nome.json')); valores=await App.readJson('eventos_valor.json', App.seed('eventos_valor.json')); participantes=await App.readJson('eventos_participantes.json', App.seed('eventos_participantes.json')); caixa=await App.readJson('eventos_caixa.json', App.seed('eventos_caixa.json')); bindOptions(); render(); });
  bindOptions(); render();
});
