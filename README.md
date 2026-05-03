# 🤝 App Solidário

**Controle de Doações e Distribuição de Cestas Básicas**  
Projeto extensionista — Disciplina de Programação para Dispositivos Móveis

---

## 📱 Sobre o projeto

O **App Solidário** é um protótipo de aplicativo mobile (simulado em HTML/CSS/JS puro) voltado para associações comunitárias que controlam doações de alimentos, estoque e distribuição de cestas básicas para famílias em situação de vulnerabilidade.

## ✨ Funcionalidades

| Tela | Recursos |
|------|----------|
| 🏠 Dashboard | Indicadores em tempo real, gráfico semanal, atividades recentes |
| 👪 Famílias | Cadastro, busca por texto, filtro por prioridade |
| 💚 Doações | Registro, histórico, atualização automática do estoque |
| 🏪 Estoque | Barras de progresso com alertas visuais de nível |
| 📬 Entregas | Timeline de entregas, registro com select de famílias |
| 📊 Relatórios | Resumo estatístico, gráficos de produtos e bairros |

## 🗂️ Estrutura do projeto

```
app-solidario/
├── index.html       # Estrutura HTML + modais
├── css/
│   └── style.css    # Estilos, variáveis, animações
└── js/
    ├── dados.js     # Dados simulados (famílias, doações, estoque, entregas)
    └── app.js       # Lógica de navegação, renderização e interatividade
```

## 🚀 Como rodar

Basta abrir o `index.html` diretamente no navegador — sem servidor, sem dependências.

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 com variáveis customizadas e animações
- JavaScript vanilla (ES6+)
- Google Fonts — Outfit
- Zero dependências externas além da fonte

## 🎨 Design

- Mobile-first, largura ~430px com frame de celular no desktop
- Paleta verde/teal transmitindo solidariedade e confiança
- Componentes: cards, modais bottom-sheet, toasts, chips, progress bars
- Animações suaves nas transições de tela e abertura de modais
