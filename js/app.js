/* ===========================
   APP SOLIDÁRIO — LÓGICA PRINCIPAL
   =========================== */

let chipAtivo = 'todas';

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
  const modal = document.getElementById(id);
  modal.classList.add('aberto');
  if (id === 'modal-entrega') preencherSelectFamilias();
  if (id === 'modal-doacao')  document.getElementById('d-data').value = hojeISO();
  if (id === 'modal-entrega') document.getElementById('e-data').value = hojeISO();
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('aberto');
}

function fecharModalFora(e, el) {
  if (e.target === el) el.classList.remove('aberto');
}

function preencherSelectFamilias() {
  const sel = document.getElementById('e-familia');
  sel.innerHTML = familias.map(f =>
    `<option value="${f.responsavel}">${f.responsavel} — ${f.bairro}</option>`
  ).join('');
}

/* ===========================
   DASHBOARD
   =========================== */
function renderDashboard() {
  document.getElementById('data-hoje').textContent = formatarData(new Date());
  document.getElementById('total-familias').textContent = familias.length;
  document.getElementById('total-entregas-mes').textContent = entregas.length;
  document.getElementById('total-itens').textContent = estoque.length;
  document.getElementById('total-baixo-estoque').textContent =
    estoque.filter(e => e.quantidade <= e.minimo).length;

  const diasSemana  = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const valoresSemana = [12, 8, 18, 5, 22, 15, 10];
  const maxVal = Math.max(...valoresSemana);
  const cores  = ['#2E8B57','#00897B','#4CAF6F','#00796B','#1B6B3A','#43A047','#26A69A'];

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
   FAMÍLIAS
   =========================== */
function renderFamilias(lista) {
  const dadosParaRenderizar = lista || familias;
  document.getElementById('familias-count').textContent = `${familias.length} cadastradas`;
  document.getElementById('lista-familias').innerHTML = dadosParaRenderizar.length === 0
    ? `<div class="estado-vazio"><span class="estado-vazio-emoji">🔎</span>Nenhuma família encontrada.</div>`
    : dadosParaRenderizar.map(f => {
        const badgeClass = f.prioridade === 'alta' ? 'badge-vermelho' : f.prioridade === 'media' ? 'badge-amarelo' : 'badge-verde';
        const labelPrioridade = f.prioridade === 'alta' ? 'Alta' : f.prioridade === 'media' ? 'Média' : 'Normal';
        return `<div class="lista-item">
          <div class="lista-avatar la-verde">👨‍👩‍👧</div>
          <div class="lista-info">
            <div class="lista-nome">${f.responsavel}</div>
            <div class="lista-sub">${f.bairro} · ${f.moradores} pessoa${f.moradores > 1 ? 's' : ''}</div>
          </div>
          <span class="badge ${badgeClass}">${labelPrioridade}</span>
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

function salvarFamilia() {
  const responsavel = document.getElementById('f-responsavel').value.trim();
  if (!responsavel) { mostrarToast('⚠️ Informe o nome do responsável.', 'laranja'); return; }

  familias.push({
    id: familias.length + 1,
    responsavel,
    cpf:       document.getElementById('f-cpf').value || '000.000.000-00',
    telefone:  document.getElementById('f-telefone').value || '(00) 00000-0000',
    endereco:  document.getElementById('f-endereco').value || 'Não informado',
    bairro:    document.getElementById('f-bairro').value || 'Não informado',
    moradores: parseInt(document.getElementById('f-moradores').value) || 1,
    prioridade: document.getElementById('f-prioridade').value,
    status: 'ativo',
    obs:    document.getElementById('f-obs').value,
  });

  fecharModal('modal-familia');
  limparFormFamilia();
  renderFamilias();
  renderDashboard();
  mostrarToast('✅ Família cadastrada com sucesso!', 'verde');
}

function limparFormFamilia() {
  ['f-responsavel','f-cpf','f-telefone','f-endereco','f-bairro','f-moradores','f-obs']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('f-prioridade').value = 'normal';
}

/* ===========================
   DOAÇÕES
   =========================== */
function renderDoacoes() {
  document.getElementById('doacoes-count').textContent = `${doacoes.length} registros no total`;
  const emojis = { 'Arroz':'🍚','Feijão':'🫘','Óleo':'🫙','Macarrão':'🍝','Açúcar':'🍬','Leite':'🥛','Farinha':'🌾' };
  const cores   = ['la-verde','la-teal','la-azul','la-laranja','la-amarelo'];

  document.getElementById('lista-doacoes').innerHTML = [...doacoes].reverse().map((d, i) =>
    `<div class="lista-item">
      <div class="lista-avatar ${cores[i % cores.length]}">${emojis[d.produto] || '📦'}</div>
      <div class="lista-info">
        <div class="lista-nome">${d.doador}</div>
        <div class="lista-sub">${d.produto} · ${d.quantidade} unidades · ${formatarDataBR(d.data)}</div>
      </div>
    </div>`
  ).join('');
}

function salvarDoacao() {
  const doador = document.getElementById('d-doador').value.trim();
  if (!doador) { mostrarToast('⚠️ Informe o nome do doador.', 'laranja'); return; }

  const produto    = document.getElementById('d-produto').value;
  const quantidade = parseInt(document.getElementById('d-quantidade').value) || 1;
  const data       = document.getElementById('d-data').value || hojeISO();

  doacoes.push({ id: doacoes.length + 1, doador, produto, quantidade, data,
    telefone: document.getElementById('d-telefone').value || '' });

  const itemEstoque = estoque.find(e => e.produto === produto);
  if (itemEstoque) itemEstoque.quantidade = Math.min(itemEstoque.quantidade + quantidade, itemEstoque.maximo + 50);

  fecharModal('modal-doacao');
  ['d-doador','d-quantidade','d-telefone'].forEach(id => { document.getElementById(id).value = ''; });
  renderDoacoes();
  renderDashboard();
  mostrarToast('✅ Doação registrada com sucesso!', 'verde');
}

/* ===========================
   ESTOQUE
   =========================== */
function renderEstoque(lista) {
  const dadosParaRenderizar = lista || estoque;

  document.getElementById('card-estoque').innerHTML = dadosParaRenderizar.map(item => {
    const pct        = Math.min(Math.round((item.quantidade / item.maximo) * 100), 100);
    const abaixoMin  = item.quantidade <= item.minimo;
    const atencao    = item.quantidade > item.minimo && item.quantidade <= item.minimo * 1.5;
    const progClasse = abaixoMin ? 'prog-vermelho' : atencao ? 'prog-amarelo' : 'prog-verde';
    const qtdCor     = abaixoMin ? 'var(--vermelho)' : atencao ? 'var(--amarelo)' : 'var(--verde-primario)';
    const badgeLabel = abaixoMin ? 'Baixo' : atencao ? 'Atenção' : 'OK';
    const badgeClass = abaixoMin ? 'badge-vermelho' : atencao ? 'badge-amarelo' : 'badge-verde';

    return `<div class="estoque-item">
      <div class="estoque-header">
        <div class="estoque-nome">${item.emoji} ${item.produto}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="estoque-qtd" style="color:${qtdCor}">${item.quantidade} un.</span>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </div>
      </div>
      <div class="progresso-barra">
        <div class="progresso-fill ${progClasse}" style="width:${pct}%"></div>
      </div>
    </div>`;
  }).join('');
}

function filtrarEstoque() {
  const termo    = document.getElementById('busca-estoque').value.toLowerCase();
  const resultado = estoque.filter(e => e.produto.toLowerCase().includes(termo));
  renderEstoque(resultado);
}

/* ===========================
   ENTREGAS
   =========================== */
function renderEntregas() {
  document.getElementById('entregas-count').textContent =
    `${entregas.length} entrega${entregas.length !== 1 ? 's' : ''} registradas`;

  document.getElementById('lista-entregas').innerHTML = [...entregas].reverse().map(e =>
    `<div class="timeline-item">
      <div class="timeline-dot-wrap">
        <div class="timeline-dot">📦</div>
      </div>
      <div class="timeline-info">
        <div class="timeline-familia">${e.familia}</div>
        <div class="timeline-meta">${formatarDataBR(e.data)} · ${e.responsavelEntrega}</div>
        ${e.obs ? `<div class="timeline-meta" style="color:var(--verde-medio);margin-top:2px">${e.obs}</div>` : ''}
      </div>
    </div>`
  ).join('');
}

function salvarEntrega() {
  const familia            = document.getElementById('e-familia').value;
  const responsavelEntrega = document.getElementById('e-responsavel').value.trim() || 'Voluntário(a)';
  const data               = document.getElementById('e-data').value || hojeISO();
  const obs                = document.getElementById('e-obs').value.trim();

  entregas.push({ id: entregas.length + 1, familia, responsavelEntrega, data, obs });
  fecharModal('modal-entrega');
  ['e-responsavel','e-obs'].forEach(id => { document.getElementById(id).value = ''; });
  renderEntregas();
  renderDashboard();
  mostrarToast('✅ Entrega registrada com sucesso!', 'verde');
}

/* ===========================
   RELATÓRIOS
   =========================== */
function renderRelatorios() {
  const famPrioritarias = familias.filter(f => f.prioridade === 'alta').length;
  const totalItens      = doacoes.reduce((s, d) => s + d.quantidade, 0);

  document.getElementById('stat-grid').innerHTML = [
    { emoji:'💚', num: doacoes.length,    label:'Total de doações' },
    { emoji:'📦', num: entregas.length,   label:'Cestas entregues' },
    { emoji:'🔴', num: famPrioritarias,   label:'Famílias prioritárias' },
    { emoji:'📊', num: totalItens + ' un',label:'Itens arrecadados' },
  ].map(s => `<div class="stat-card">
    <div class="stat-emoji">${s.emoji}</div>
    <div class="stat-num">${s.num}</div>
    <div class="stat-label">${s.label}</div>
  </div>`).join('');

  const contagemProdutos  = {};
  doacoes.forEach(d => { contagemProdutos[d.produto] = (contagemProdutos[d.produto] || 0) + d.quantidade; });
  const produtosOrdenados = Object.entries(contagemProdutos).sort((a, b) => b[1] - a[1]);
  const maxProd           = produtosOrdenados[0]?.[1] || 1;
  const coresProd = ['#2E8B57','#00897B','#4CAF6F','#00796B','#43A047','#1B6B3A','#26A69A'];

  document.getElementById('relatorio-produtos').innerHTML = produtosOrdenados.map(([prod, qtd], i) =>
    `<div class="rel-barra-item">
      <div class="rel-barra-header"><span>${prod}</span><span style="font-weight:700">${qtd} un.</span></div>
      <div class="rel-barra-track"><div class="rel-barra-fill" style="width:${Math.round((qtd/maxProd)*100)}%;background:${coresProd[i % coresProd.length]}"></div></div>
    </div>`
  ).join('');

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
  const toast = document.createElement('div');
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
  const dias   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const meses  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
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
  renderDashboard();
  renderFamilias();
  renderDoacoes();
  renderEstoque();
  renderEntregas();
  renderRelatorios();
});
