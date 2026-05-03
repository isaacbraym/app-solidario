/* ===========================
   APP SOLIDÁRIO — DADOS SIMULADOS
   =========================== */

let familias = [
  { id:1, responsavel:'Ana Maria Santos',    cpf:'142.387.291-05', telefone:'(84) 98712-3345', endereco:'Rua das Acácias, 14',   bairro:'Vila Nova',     moradores:5, prioridade:'alta',   status:'ativo', obs:'Mãe solo, 3 filhos menores.' },
  { id:2, responsavel:'José Pereira Lima',   cpf:'365.112.408-77', telefone:'(84) 99203-8821', endereco:'Av. Principal, 302',    bairro:'Centro',        moradores:3, prioridade:'media',  status:'ativo', obs:'Desempregado há 6 meses.' },
  { id:3, responsavel:'Francisca Gomes',     cpf:'589.023.774-11', telefone:'(84) 98334-6610', endereco:'Rua Boa Vista, 88',     bairro:'Jardim Bela',   moradores:7, prioridade:'alta',   status:'ativo', obs:'Família numerosa, idoso acamado.' },
  { id:4, responsavel:'Raimundo Costa',      cpf:'201.445.882-33', telefone:'(84) 97712-5523', endereco:'Travessa Sul, 21',      bairro:'Planalto',      moradores:2, prioridade:'normal', status:'ativo', obs:'Aposentado, renda mínima.' },
  { id:5, responsavel:'Maria Aparecida',     cpf:'774.231.900-66', telefone:'(84) 99001-4478', endereco:'Rua das Flores, 55',    bairro:'Vila Nova',     moradores:4, prioridade:'media',  status:'ativo', obs:'PCD na família.' },
  { id:6, responsavel:'Edilson Barbosa',     cpf:'638.910.155-44', telefone:'(84) 98556-7732', endereco:'Rua do Campo, 9',      bairro:'Novo Horizonte', moradores:6, prioridade:'alta',   status:'ativo', obs:'Recém cadastrado pela assistente social.' },
  { id:7, responsavel:'Conceição Rocha',     cpf:'412.775.638-90', telefone:'(84) 98100-2234', endereco:'Rua XV de Nov., 107',  bairro:'Centro',        moradores:3, prioridade:'normal', status:'ativo', obs:'' },
  { id:8, responsavel:'Antônio Silveira',    cpf:'900.234.511-22', telefone:'(84) 97823-4499', endereco:'Av. das Nações, 44',   bairro:'Planalto',      moradores:5, prioridade:'media',  status:'ativo', obs:'Filhos em idade escolar.' },
];

let doacoes = [
  { id:1, doador:'Supermercado Bom Preço',       produto:'Arroz',    quantidade:50, data:'2025-05-01', telefone:'(84) 3322-0011' },
  { id:2, doador:'Igreja São Francisco',          produto:'Feijão',   quantidade:30, data:'2025-05-02', telefone:'(84) 3311-4422' },
  { id:3, doador:'Ana Paula Rodrigues',           produto:'Óleo',     quantidade:24, data:'2025-05-03', telefone:'(84) 99200-3344' },
  { id:4, doador:'Escola Municipal 3',            produto:'Macarrão', quantidade:40, data:'2025-04-28', telefone:'(84) 3344-5566' },
  { id:5, doador:'Familia Mendonça',              produto:'Açúcar',   quantidade:15, data:'2025-04-25', telefone:'(84) 98700-2211' },
  { id:6, doador:'Padaria do Povo',               produto:'Farinha',  quantidade:20, data:'2025-04-22', telefone:'(84) 3200-1100' },
  { id:7, doador:'Sindicato dos Trabalhadores',   produto:'Leite',    quantidade:60, data:'2025-04-20', telefone:'(84) 3100-9988' },
  { id:8, doador:'João Carlos Silva',             produto:'Arroz',    quantidade:10, data:'2025-04-18', telefone:'(84) 99112-6677' },
];

let estoque = [
  { produto:'Arroz',    emoji:'🍚', quantidade:145, minimo:30, maximo:200 },
  { produto:'Feijão',   emoji:'🫘', quantidade:92,  minimo:30, maximo:150 },
  { produto:'Óleo',     emoji:'🫙', quantidade:18,  minimo:20, maximo:80  },
  { produto:'Macarrão', emoji:'🍝', quantidade:74,  minimo:25, maximo:120 },
  { produto:'Açúcar',   emoji:'🍬', quantidade:55,  minimo:25, maximo:100 },
  { produto:'Leite',    emoji:'🥛', quantidade:12,  minimo:20, maximo:60  },
  { produto:'Farinha',  emoji:'🌾', quantidade:38,  minimo:20, maximo:80  },
];

let entregas = [
  { id:1, familia:'Ana Maria Santos',   responsavelEntrega:'Carlos Mendes',    data:'2025-05-03', obs:'Entrega realizada com sucesso.' },
  { id:2, familia:'Francisca Gomes',    responsavelEntrega:'Maria Voluntária',  data:'2025-05-02', obs:'' },
  { id:3, familia:'José Pereira Lima',  responsavelEntrega:'Carlos Mendes',    data:'2025-05-01', obs:'' },
  { id:4, familia:'Raimundo Costa',     responsavelEntrega:'Pedro Henrique',   data:'2025-04-29', obs:'Família agradecida.' },
  { id:5, familia:'Maria Aparecida',    responsavelEntrega:'Maria Voluntária',  data:'2025-04-27', obs:'' },
  { id:6, familia:'Edilson Barbosa',    responsavelEntrega:'Carlos Mendes',    data:'2025-04-25', obs:'Primeira entrega para a família.' },
];
