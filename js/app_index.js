App.registerSeed('faturacao.json', []);
App.registerSeed('dados_bancarios.json', []);
App.registerSeed('eventos_nome.json', []);
App.registerSeed('fornecedores.json', []);
document.addEventListener('DOMContentLoaded', async () => {
  const ui = App.wireCommon('index', { searchPlaceholder: 'Pesquisar movimentos, fornecedores ou eventos' });

  function isReceita(row) {
    return String(row.tipo || '').toUpperCase() === 'RECEITA';
  }

  function isDespesa(row) {
    return String(row.tipo || '').toUpperCase() === 'DESPESA';
  }

  function isTesourariaCash(row) {
    const origem = String(row.origem || '').toUpperCase().trim();
    return origem === 'CAIXA' || origem === 'CAIXA-BAR';
  }

  function isBarMovement(row) {
    const origem = String(row.origem || '').toUpperCase().trim();
    return origem === 'CAIXA-BAR';
  }

  function sumMontante(rows) {
    return rows.reduce((s, r) => s + Number(r.montante || 0), 0);
  }

  async function render() {
    const fat = await App.readJson('faturacao.json', App.seed('faturacao.json'));
    const eventos = await App.readJson('eventos_nome.json', App.seed('eventos_nome.json'));
    const forn = await App.readJson('fornecedores.json', App.seed('fornecedores.json'));

    ui.setYearOptions([...new Set(fat.map(r => String(r.ano)).filter(Boolean))]);

    const year = ui.year === 'Todos' ? String(new Date().getFullYear()) : String(ui.year);
    const rows = fat.filter(r => String(r.ano) === year);

    const receita = sumMontante(rows.filter(isReceita));
    const despesa = sumMontante(rows.filter(isDespesa));
    const saldo = receita - despesa;

    const tesourariaRows = rows.filter(isTesourariaCash);
    const tesourariaReceita = sumMontante(tesourariaRows.filter(isReceita));
    const tesourariaDespesa = sumMontante(tesourariaRows.filter(isDespesa));
    const tesourariaSaldo = tesourariaReceita - tesourariaDespesa;

    const barRows = rows.filter(isBarMovement);
    const barReceita = sumMontante(barRows.filter(isReceita));
    const barDespesa = sumMontante(barRows.filter(isDespesa));
    const barSaldo = barReceita - barDespesa;

    document.getElementById('mReceita').textContent = App.formatEuro(receita);
    document.getElementById('mDespesa').textContent = App.formatEuro(despesa);
    document.getElementById('mSaldo').textContent = App.formatEuro(saldo);

    document.getElementById('mTesouraria').textContent = App.formatEuro(tesourariaSaldo);
    document.getElementById('mTesourariaSub').textContent =
      `${App.formatEuro(tesourariaReceita)} receita / ${App.formatEuro(tesourariaDespesa)} despesa`;

    document.getElementById('mBar').textContent = App.formatEuro(barSaldo);
    document.getElementById('mBarSub').textContent =
      `${App.formatEuro(barReceita)} receita / ${App.formatEuro(barDespesa)} despesa`;

    const q = ui.search.value.trim().toLowerCase();

    let latest = [...rows].sort((a, b) => String(b.data).localeCompare(String(a.data)));
    if (q) latest = latest.filter(r => JSON.stringify(r).toLowerCase().includes(q));

    document.getElementById('ultimosMovimentos').innerHTML =
      latest.slice(0, 8).map(r => `
        <tr>
          <td>${App.escapeHtml(r.data)}</td>
          <td>${App.escapeHtml(r.descricao || 'N.A.')}</td>
          <td class="${String(r.tipo).toUpperCase() === 'RECEITA' ? 'txt-income' : 'txt-expense'}">${App.escapeHtml(r.tipo)}</td>
          <td class="money">${App.formatEuro(r.montante)}</td>
        </tr>
      `).join('') || '<tr><td colspan="4" class="empty">Sem movimentos.</td></tr>';

    let pend = rows.filter(r => String(r.situacao).toUpperCase() === 'POR REGULARIZAR');
    if (q) pend = pend.filter(r => JSON.stringify(r).toLowerCase().includes(q));

    document.getElementById('porRegularizar').innerHTML =
      pend.slice(0, 8).map(r => `
        <tr>
          <td>${App.escapeHtml(r.data)}</td>
          <td>${App.escapeHtml(r.fornecedor_id || 'N.A.')}</td>
          <td class="money">${App.formatEuro(r.montante)}</td>
        </tr>
      `).join('') || '<tr><td colspan="3" class="empty">Sem pendentes.</td></tr>';

    document.getElementById('nEventos').textContent =
      eventos.filter(e => String(new Date(e.data_evento).getFullYear()) === year).length;

    document.getElementById('nFornecedores').textContent =
      forn.filter(f => f.ativo !== false).length;

    document.getElementById('nSemVerif').textContent =
      rows.filter(r => !r.verif_ft).length;
  }

  ui.search.addEventListener('input', render);
  window.addEventListener('acrd:year-changed', render);
  window.addEventListener('acrd:data-folder-changed', render);

  render();
});
