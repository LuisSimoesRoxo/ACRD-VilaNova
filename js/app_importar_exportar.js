document.addEventListener('DOMContentLoaded', () => {
  const ui = App.wireCommon('importar_exportar', { searchPlaceholder:'Pesquisar ficheiro' });
  const files = ['app_config.json','audit_log.json','cod_acrd.json','dados_bancarios.json','eventos_caixa.json','eventos_nome.json','eventos_participantes.json','eventos_valor.json','faturacao.json','fornecedores.json','membros_diretivos.json','membros_diretivos_funcao.json','precario.json','tabelas_aux.json'];
  document.getElementById('filesList').innerHTML = files.map(f => `<li class="mono">${App.escapeHtml(f)}</li>`).join('');
  document.getElementById('openFolderInlineBtn').onclick = async () => { await App.chooseDataFolder(); };
  document.getElementById('verifyFilesBtn').onclick = async () => {
    const result = [];
    for (const f of files) {
      try {
        const rows = await App.readJson(f, []);
        result.push(`<div><strong>${App.escapeHtml(f)}</strong>: ${Array.isArray(rows) ? rows.length + ' registos' : 'objeto OK'}</div>`);
      } catch (e) {
        result.push(`<div><strong>${App.escapeHtml(f)}</strong>: erro</div>`);
      }
    }
    document.getElementById('verifyResult').innerHTML = result.join('');
  };
});