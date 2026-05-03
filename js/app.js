/* ===========================
   APP SOLIDÁRIO — LÓGICA v2
   Dark mode · Edit/Delete · Stock ±· Reports · PWA
   =========================== */

/* ===========================
   ESTADO DA APLICAÇÃO
   =========================== */
let chipAtivo          = 'todas';
let familiaEmEdicaoId  = null;   // null = criar, número = editar
let periodoRelatorio   = 'mes';  // 'semana' | 'mes' | 'tudo'
let deferredPwaPrompt  = null;

/* ===========================
   PWA — SERVICE WORKER + INSTALAÇÃO
   =========================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const banner = document.getElementById('banner-pwa');
  if (banner) banner.classList.add('visivel');
});

function instalarPwa() {
  if (!deferredPwaPrompt) return;
  deferredPwaPrompt.prompt();
  deferredPwaPrompt.userChoice.then(() => {
    deferredPwaPrompt = null;
    const banner = document.getElementById('banner-pwa');
    if (banner) banner.classList.remove('visivel');
  });
}

/* ===========================
   DARK MODE
   =========================== */
function inicializarTema() {
  const temaSalvo = localStorage.getItem('tema') || 'light';
  aplicarTema(temaSalvo);
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  document.getElementById('btn-tema').textContent = tema === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('tema', tema);
}

function alternarTema() {
  const temaAtual = document.documentElement.getAttribute('data-theme') || 'light';
  aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
}

/* ===========================
   NAVEGAÇÃO
   =========================== */
function navegarPara(tela, botaoNav) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById('tela-' + tela).classList.add('ativa');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('ativo'));
  botaoNav.classList.add('ativo');
  document.getElementById('conteudo').scrollTop = 0;
  renderizarTela(tela);
}

function renderizarTela(tela) {
  if (tela === 'inicio')     renderDashboard();
  if (tela === 'familias')   renderFamilias();
  if (tela === 'doacoes')    renderDoacoes();
  if (tela === 'estoque')    renderEstoque();
  if (tela === 'entregas')   renderEntregas();
  if (tela === 'relatorios') renderRelatorios();
}

/* ===========================
   MODAIS
   =========================== */
function abrirModal(id) {
  document.getElementById(id).classList.add('aberto');
  if (id === 'modal-doacao')  document.getElementById('d-data').value = hojeISO();
  if (id === 'modal-entrega') {
    preencherSelectFamilias();
    document.getElementById('e-data').value = hojeISO();
  }
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('aberto');
  if (id === 'modal-familia') {
    limparFormFamilia();
    familiaEmEdicaoId = null;
    document.getElementById('modal-familia-titulo').textContent = '👪 Cadastrar Família';
    document.getElementById('modal-familia-btn').textContent = '✅ Cadastrar Família';
    const btnExcluir = document.getElementById('btn-excluir-familia');
    if (btnExcluir) btnExcluir.style.display = 'none';
  }
}

function fecharModalFora(e, el) {
  if (e.target === el) fecharModal(el.id);
}

function preencherSelectFamilias() {
  document.getElementById('e-familia').innerHTML = familias.map(f =>
    `<option value="${f.id}">${f.responsavel} — ${f.bairro}</option>`
  ).join('');
}

/* ===========================
   DASHBOARD
   =========================== */
function renderDashboard() {
  document.getElementById('data-hoje').textContent = formatarData(new Date());
  document.getElementById('total-familias').textContent     = familias.length;
  document.getElementById('total-entregas-mes').textContent = entregas.length;
  document.getElementById('total-itens').textContent        = estoque.length;
  document.getElementById('total-baixo-estoque').textContent =
    estoque.filter(e => e.quantidade <= e.minimo).length;

  const diasSemana    = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const valoresSemana = [12, 8, 18, 5, 22, 15, 10];
  const maxVal        = Math.max(...valoresSemana);
  const cores         = ['#2E8B57','#00897B','#4CAF6F','#00796B','#1B6B3A','#43A047','#26A69A'];

  document.getElementById('grafico-semana').innerHTML = diasSemana.map((d, i) => {
    const pct = Math.round((valoresSemana[i] / maxVal) * 100);
    return `<div class="barra-wrap">
      <div class="barra-val">${valoresSemana[i]}</div>
      <div class="barra" style="height:${pct}%;background:${cores[i]};opacity:${i === 4 ? 1 : 0.7}"></div>
      <div class="barra-label">${d}</div>
    </div>`;
  }).join('');

  const atividades = [
    { emoji:'📦', txt:'Cesta entregue para Ana Maria Santos', tempo:'há 2h',  cor:'la-verde' },
    { emoji:'💚', txt:'Doação recebida: 50kg de Arroz',       tempo:'há 5h',  cor:'la-teal' },
    { emoji:'👪', txt:'Nova família: Edilson Barbosa',         tempo:'ontem',  cor:'la-azul' },
    { emoji:'⚠️', txt:'Leite abaixo do estoque mínimo',       tempo:'ontem',  cor:'la-laranja' },
  ];

  document.getElementById('lista-atividades').innerHTML = atividades.map(a =>
    `<div class="lista-item">
      <div class="lista-avatar ${a.cor}">${a.emoji}</div>
      <div class="lista-info">
        <div class="lista-nome">${a.txt}</div>
        <div class="lista-sub">${a.tempo}</div>
      </div>
    </div>`
  ).join('');
}

/* ===========================
   FAMÍLIAS — CRUD COMPLETO
   =========================== */
function renderFamilias(lista) {
  const dadosParaRenderizar = lista || familias;
  document.getElementById('familias-count').textContent = `${familias.length} cadastradas`;

  document.getElementById('lista-familias').innerHTML = dadosParaRenderizar.length === 0
    ? `<div class="estado-vazio"><span class="estado-vazio-emoji">🔎</span>Nenhuma família encontrada.</div>`
    : dadosParaRenderizar.map(f => {
        const badgeClass      = f.prioridade === 'alta' ? 'badge-vermelho' : f.prioridade === 'media' ? 'badge-amarelo' : 'badge-verde';
        const labelPrioridade = f.prioridade === 'alta' ? 'Alta' : f.prioridade === 'media' ? 'Média' : 'Normal';
        return `<div class="lista-item">
          <div class="lista-avatar la-verde">👨‍👩‍👧</div>
          <div class="lista-info">
            <div class="lista-nome">${f.responsavel}</div>
            <div class="lista-sub">${f.bairro} · ${f.moradores} pessoa${f.moradores > 1 ? 's' : ''}</div>
          </div>
          <span class="badge ${badgeClass}">${labelPrioridade}</span>
          <div class="lista-acoes">
            <button class="btn-lista-acao btn-editar"  onclick="abrirEdicaoFamilia(${f.id})" title="Editar">✏️</button>
            <button class="btn-lista-acao btn-excluir" onclick="excluirFamilia(${f.id})"     title="Excluir">🗑️</button>
          </div>
        </div>`;
      }).join('');
}

function filtrarFamilias() {
  const termo = document.getElementById('busca-familias').value.toLowerCase();
  let resultado = familias.filter(f =>
    f.responsavel.toLowerCase().includes(termo) || f.bairro.toLowerCase().includes(termo)
  );
  if (chipAtivo !== 'todas') resultado = resultado.filter(f => f.prioridade === chipAtivo);
  renderFamilias(resultado);
}

function filtrarChip(btn, tipo) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('ativo'));
  btn.classList.add('ativo');
  chipAtivo = tipo;
  filtrarFamilias();
}

function abrirModalNovaFamilia() {
  familiaEmEdicaoId = null;
  limparFormFamilia();
  document.getElementById('modal-familia-titulo').textContent = '👪 Cadastrar Família';
  document.getElementById('modal-familia-btn').textContent    = '✅ Cadastrar Família';
  document.getElementById('btn-excluir-familia').style.display = 'none';
  abrirModal('modal-familia');
}

function abrirEdicaoFamilia(id) {
  const familia = familias.find(f => f.id === id);
  if (!familia) return;

  familiaEmEdicaoId = id;
  document.getElementById('f-responsavel').value = familia.responsavel;
  document.getElementById('f-cpf').value        = familia.cpf;
  document.getElementById('f-telefone').value   = familia.telefone;
  document.getElementById('f-endereco').value   = familia.endereco;
  document.getElementById('f-bairro').value     = familia.bairro;
  document.getElementById('f-moradores').value  = familia.moradores;
  document.getElementById('f-prioridade').value = familia.prioridade;
  document.getElementById('f-obs').value        = familia.obs;

  document.getElementById('modal-familia-titulo').textContent  = '✏️ Editar Família';
  document.getElementById('modal-familia-btn').textContent     = '💾 Salvar Alterações';
  document.getElementById('btn-excluir-familia').style.display = 'block';
  abrirModal('modal-familia');
}

function salvarFamilia() {
  const responsavel = document.getElementById('f-responsavel').value.trim();
  if (!responsavel) {
    document.getElementById('f-responsavel').classList.add('invalido');
    setTimeout(() => document.getElementById('f-responsavel').classList.remove('invalido'), 600);
    mostrarToast('⚠️ Informe o nome do responsável.', 'laranja');
    return;
  }

  const dadosFamilia = {
    responsavel,
    cpf:        document.getElementById('f-cpf').value       || '000.000.000-00',
    telefone:   document.getElementById('f-telefone').value   || '(00) 00000-0000',
    endereco:   document.getElementById('f-endereco').value   || 'Não informado',
    bairro:     document.getElementById('f-bairro').value     || 'Não informado',
    moradores:  parseInt(document.getElementById('f-moradores').value) || 1,
    prioridade: document.getElementById('f-prioridade').value,
    status:     'ativo',
    obs:        document.getElementById('f-obs').value,
  };

  if (familiaEmEdicaoId !== null) {
    // EDITAR
    const indice = familias.findIndex(f => f.id === familiaEmEdicaoId);
    if (indice !== -1) familias[indice] = { ...familias[indice], ...dadosFamilia };
    mostrarToast('✅ Família atualizada com sucesso!', 'verde');
  } else {
    // CRIAR
    familias.push({ id: Date.now(), ...dadosFamilia });
    mostrarToast('✅ Família cadastrada com sucesso!', 'verde');
  }

  fecharModal('modal-familia');
  renderFamilias();
  renderDashboard();
}

function excluirFamilia(id) {
  const familia = familias.find(f => f.id === id);
  if (!familia) return;
  if (!confirm(`Excluir a família de ${familia.responsavel}? Esta ação não pode ser desfeita.`)) return;
  familias = familias.filter(f => f.id !== id);
  fecharModal('modal-familia');
  renderFamilias();
  renderDashboard();
  mostrarToast('🗑️ Família removida.', 'laranja');
}

function limparFormFamilia() {
  ['f-responsavel','f-cpf','f-telefone','f-endereco','f-bairro','f-moradores','f-obs']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('f-prioridade').value = 'normal';
}

/* ===========================
   DOAÇÕES — CRUD (excluir)
   =========================== */
function renderDoacoes() {
  document.getElementById('doacoes-count').textContent = `${doacoes.length} registros no total`;
  const emojis = { 'Arroz':'🍚','Feijão':'🫘','Óleo':'🫙','Macarrão':'🍝','Açúcar':'🍬','Leite':'🥛','Farinha':'🌾' };
  const cores   = ['la-verde','la-teal','la-azul','la-laranja','la-amarelo'];

  document.getElementById('lista-doacoes').innerHTML = doacoes.length === 0
    ? `<div class="estado-vazio"><span class="estado-vazio-emoji">💚</span>Nenhuma doação registrada ainda.</div>`
    : [...doacoes].reverse().map((d, i) =>
      `<div class="lista-item">
        <div class="lista-avatar ${cores[i % cores.length]}">${emojis[d.produto] || '📦'}</div>
        <div class="lista-info">
          <div class="lista-nome">${d.doador}</div>
          <div class="lista-sub">${d.produto} · ${d.quantidade} un. · ${formatarDataBR(d.data)}</div>
        </div>
        <div class="lista-acoes">
          <button class="btn-lista-acao btn-excluir" onclick="excluirDoacao(${d.id})" title="Excluir">🗑️</button>
        </div>
      </div>`
    ).join('');
}

function salvarDoacao() {
  const doador = document.getElementById('d-doador').value.trim();
  if (!doador) {
    document.getElementById('d-doador').classList.add('invalido');
    setTimeout(() => document.getElementById('d-doador').classList.remove('invalido'), 600);
    mostrarToast('⚠️ Informe o nome do doador.', 'laranja');
    return;
  }

  const produto    = document.getElementById('d-produto').value;
  const quantidade = parseInt(document.getElementById('d-quantidade').value) || 1;
  const data       = document.getElementById('d-data').value || hojeISO();

  doacoes.push({ id: Date.now(), doador, produto, quantidade, data,
    telefone: document.getElementById('d-telefone').value || '' });

  const itemEstoque = estoque.find(e => e.produto === produto);
  if (itemEstoque) itemEstoque.quantidade = Math.min(itemEstoque.quantidade + quantidade, itemEstoque.maximo + 50);

  fecharModal('modal-doacao');
  ['d-doador','d-quantidade','d-telefone'].forEach(id => { document.getElementById(id).value = ''; });
  renderDoacoes();
  renderDashboard();
  mostrarToast('✅ Doação registrada com sucesso!', 'verde');
}

function excluirDoacao(id) {
  if (!confirm('Excluir este registro de doação?')) return;
  doacoes = doacoes.filter(d => d.id !== id);
  renderDoacoes();
  mostrarToast('🗑️ Doação removida.', 'laranja');
}

/* ===========================
   ESTOQUE — AJUSTE ± MANUAL
   =========================== */
function renderEstoque(lista) {
  const dadosParaRenderizar = lista || estoque;

  document.getElementById('card-estoque').innerHTML = dadosParaRenderizar.map(item => {
    const pct        = Math.min(Math.round((item.quantidade / item.maximo) * 100), 100);
    const abaixoMin  = item.quantidade <= item.minimo;
    const atencao    = item.quantidade > item.minimo && item.quantidade <= item.minimo * 1.5;
    const progClasse = abaixoMin ? 'prog-vermelho' : atencao ? 'prog-amarelo' : 'prog-verde';
    const qtdCor     = abaixoMin ? 'var(--vermelho)' : atencao ? 'var(--amarelo)' : 'var(--verde-primario)';
    const badgeLabel = abaixoMin ? 'Crítico' : atencao ? 'Atenção' : 'OK';
    const badgeClass = abaixoMin ? 'badge-vermelho' : atencao ? 'badge-amarelo' : 'badge-verde';

    return `<div class="estoque-item">
      <div class="estoque-header">
        <div class="estoque-nome">${item.emoji} ${item.produto}
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="estoque-controles">
          <button class="btn-estoque btn-menos" onclick="ajustarEstoque('${item.produto}', -1)">−</button>
          <span class="estoque-qtd" style="color:${qtdCor}">${item.quantidade} un.</span>
          <button class="btn-estoque btn-mais"  onclick="ajustarEstoque('${item.produto}', +1)">+</button>
        </div>
      </div>
      <div class="progresso-barra">
        <div class="progresso-fill ${progClasse}" style="width:${pct}%"></div>
      </div>
    </div>`;
  }).join('');
}

function ajustarEstoque(nomeProduto, delta) {
  const item = estoque.find(e => e.produto === nomeProduto);
  if (!item) return;
  item.quantidade = Math.max(0, item.quantidade + delta);
  renderEstoque();
  renderDashboard();

  if (item.quantidade <= item.minimo) {
    mostrarToast(`⚠️ ${item.produto} em estoque crítico!`, 'vermelho');
  }
}

function filtrarEstoque() {
  const termo     = document.getElementById('busca-estoque').value.toLowerCase();
  const resultado = estoque.filter(e => e.produto.toLowerCase().includes(termo));
  renderEstoque(resultado);
}

/* ===========================
   ENTREGAS — CRUD (excluir)
   =========================== */
function renderEntregas() {
  document.getElementById('entregas-count').textContent =
    `${entregas.length} entrega${entregas.length !== 1 ? 's' : ''} registradas`;

  document.getElementById('lista-entregas').innerHTML = entregas.length === 0
    ? `<div class="estado-vazio"><span class="estado-vazio-emoji">📬</span>Nenhuma entrega registrada ainda.</div>`
    : [...entregas].reverse().map(e => {
        const familiaObj = familias.find(f => f.id === Number(e.familia)) || { responsavel: e.familia };
        const nomeFamilia = familiaObj.responsavel || e.familia;
        return `<div class="timeline-item">
          <div class="timeline-dot">📦</div>
          <div class="timeline-info">
            <div class="timeline-familia">${nomeFamilia}</div>
            <div class="timeline-meta">${formatarDataBR(e.data)} · ${e.responsavelEntrega}</div>
            ${e.obs ? `<div class="timeline-meta" style="color:var(--verde-medio);margin-top:2px">${e.obs}</div>` : ''}
          </div>
          <div class="lista-acoes">
            <button class="btn-lista-acao btn-excluir" onclick="excluirEntrega(${e.id})" title="Excluir">🗑️</button>
          </div>
        </div>`;
      }).join('');
}

function salvarEntrega() {
  const familiaId          = document.getElementById('e-familia').value;
  const responsavelEntrega = document.getElementById('e-responsavel').value.trim() || 'Voluntário(a)';
  const data               = document.getElementById('e-data').value || hojeISO();
  const obs                = document.getElementById('e-obs').value.trim();

  entregas.push({ id: Date.now(), familia: familiaId, responsavelEntrega, data, obs });
  fecharModal('modal-entrega');
  ['e-responsavel','e-obs'].forEach(id => { document.getElementById(id).value = ''; });
  renderEntregas();
  renderDashboard();
  mostrarToast('✅ Entrega registrada com sucesso!', 'verde');
}

function excluirEntrega(id) {
  if (!confirm('Excluir este registro de entrega?')) return;
  entregas = entregas.filter(e => e.id !== id);
  renderEntregas();
  renderDashboard();
  mostrarToast('🗑️ Entrega removida.', 'laranja');
}

/* ===========================
   RELATÓRIOS — FILTRO + DONUT
   =========================== */
function filtrarPeriodo(btn, periodo) {
  document.querySelectorAll('.btn-periodo').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  periodoRelatorio = periodo;
  renderRelatorios();
}

function doacoesFiltradas() {
  const hoje   = new Date();
  const inicio = new Date();
  if (periodoRelatorio === 'semana') inicio.setDate(hoje.getDate() - 7);
  if (periodoRelatorio === 'mes')    inicio.setDate(1);
  if (periodoRelatorio === 'tudo')   return doacoes;
  return doacoes.filter(d => new Date(d.data) >= inicio);
}

function entregasFiltradas() {
  const hoje   = new Date();
  const inicio = new Date();
  if (periodoRelatorio === 'semana') inicio.setDate(hoje.getDate() - 7);
  if (periodoRelatorio === 'mes')    inicio.setDate(1);
  if (periodoRelatorio === 'tudo')   return entregas;
  return entregas.filter(e => new Date(e.data) >= inicio);
}

function renderRelatorios() {
  const doacoesPeriodo  = doacoesFiltradas();
  const entregasPeriodo = entregasFiltradas();
  const famPrioritarias = familias.filter(f => f.prioridade === 'alta').length;
  const totalItens      = doacoesPeriodo.reduce((s, d) => s + d.quantidade, 0);

  document.getElementById('stat-grid').innerHTML = [
    { emoji:'💚', num: doacoesPeriodo.length,  label:'Doações recebidas' },
    { emoji:'📦', num: entregasPeriodo.length,  label:'Cestas entregues' },
    { emoji:'🔴', num: famPrioritarias,          label:'Famílias prioritárias' },
    { emoji:'📊', num: totalItens + ' un',        label:'Itens arrecadados' },
  ].map(s => `<div class="stat-card">
    <div class="stat-emoji">${s.emoji}</div>
    <div class="stat-num">${s.num}</div>
    <div class="stat-label">${s.label}</div>
  </div>`).join('');

  // Donut chart de produtos mais doados
  const contagemProdutos  = {};
  doacoesPeriodo.forEach(d => { contagemProdutos[d.produto] = (contagemProdutos[d.produto] || 0) + d.quantidade; });
  const produtosOrdenados = Object.entries(contagemProdutos).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalProdutos     = produtosOrdenados.reduce((s, [, q]) => s + q, 0);

  const coresProd = ['#1B6B3A','#00796B','#4CAF6F','#F57C00','#1565C0'];

  if (produtosOrdenados.length > 0 && totalProdutos > 0) {
    // SVG Donut
    const raio = 52; const cx = 60; const cy = 60; const espessura = 18;
    const circunferencia = 2 * Math.PI * raio;
    let acumulado = 0;

    const segmentos = produtosOrdenados.map(([prod, qtd], i) => {
      const pct    = qtd / totalProdutos;
      const offset = circunferencia * (1 - acumulado);
      const dash   = circunferencia * pct;
      acumulado   += pct;
      return `<circle cx="${cx}" cy="${cy}" r="${raio}"
        fill="none" stroke="${coresProd[i]}" stroke-width="${espessura}"
        stroke-dasharray="${dash} ${circunferencia - dash}"
        stroke-dashoffset="${offset}"
        transform="rotate(-90 ${cx} ${cy})" />`;
    }).join('');

    const svgDonut = `<svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="${cx}" cy="${cy}" r="${raio}" fill="none" stroke="var(--cinza-borda)" stroke-width="${espessura}"/>
      ${segmentos}
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        style="font-family:var(--fonte);font-size:11px;font-weight:800;fill:var(--texto-principal)">
        ${produtosOrdenados.length} itens
      </text>
    </svg>`;

    const legendaHtml = produtosOrdenados.map(([prod, qtd], i) =>
      `<div class="legenda-item">
        <div class="legenda-cor" style="background:${coresProd[i]}"></div>
        <span>${prod}</span>
        <span class="legenda-pct">${Math.round((qtd/totalProdutos)*100)}%</span>
      </div>`
    ).join('');

    document.getElementById('relatorio-produtos').innerHTML =
      `<div class="donut-wrap">${svgDonut}<div class="donut-legenda">${legendaHtml}</div></div>`;
  } else {
    document.getElementById('relatorio-produtos').innerHTML =
      `<div class="estado-vazio"><span class="estado-vazio-emoji">📭</span>Sem dados para o período.</div>`;
  }

  // Bairros
  const contagemBairros  = {};
  familias.forEach(f => { contagemBairros[f.bairro] = (contagemBairros[f.bairro] || 0) + 1; });
  const bairrosOrdenados = Object.entries(contagemBairros).sort((a, b) => b[1] - a[1]);
  const maxBairro        = bairrosOrdenados[0]?.[1] || 1;

  document.getElementById('relatorio-bairros').innerHTML = bairrosOrdenados.map(([bairro, qtd], i) =>
    `<div class="rel-barra-item">
      <div class="rel-barra-header"><span>${bairro}</span><span style="font-weight:700">${qtd} família${qtd > 1 ? 's' : ''}</span></div>
      <div class="rel-barra-track"><div class="rel-barra-fill" style="width:${Math.round((qtd/maxBairro)*100)}%;background:${coresProd[i % coresProd.length]}"></div></div>
    </div>`
  ).join('');
}

/* ===========================
   TOAST
   =========================== */
function mostrarToast(mensagem, tipo = 'verde') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast     = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `<span>${mensagem}</span>`;
  document.getElementById('app-wrapper').appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

/* ===========================
   UTILITÁRIOS
   =========================== */
function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

function formatarData(data) {
  const dias  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${dias[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

function formatarDataBR(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/* ===========================
   INICIALIZAÇÃO
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  inicializarTema();
  renderDashboard();
  renderFamilias();
  renderDoacoes();
  renderEstoque();
  renderEntregas();
  renderRelatorios();
});
