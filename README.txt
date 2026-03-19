ACRD Vila Nova - Projeto final separado

Estrutura:
- /assets -> logo e recursos
- /css -> CSS comum + um CSS por página + CSS do menu
- /js -> JS comum + um JS por página
- /data -> JSON reais
- /partials -> menu separado
- /prints -> layouts de impressão separados
- /prints/js -> JS dos layouts de impressão
- /prints/css -> CSS comum de impressão

Como usar:
1. Extrai o projeto.
2. Abre index.html no browser.
3. Clica em 'Dados' no cabeçalho.
4. Escolhe a pasta /data deste projeto.
5. A partir daí, as páginas passam a ler e escrever diretamente nos JSON reais.

Notas:
- A escrita direta em ficheiros locais funciona melhor em Chrome, Edge e outros browsers Chromium recentes.
- Sem pasta de dados ligada, a aplicação mostra dados de amostra.
- Os dados da aplicação não são guardados em localStorage. Apenas preferências de interface podem ser guardadas no browser (tema/menu/ano).
