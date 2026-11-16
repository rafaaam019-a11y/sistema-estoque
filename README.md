# 🥚 Sistema de Gestão de Estoque & Vendas

> **Solução Desktop rápida, moderna e intuitiva para controle de estoque, monitoramento de prazos de validade e gestão financeira de produtos perecíveis.**

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-success?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-45.3.2-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Plataforma](https://img.shields.io/badge/Plataforma-Windows%20(x64)-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green?style=for-the-badge)

---

## 🎯 O Problema que este Sistema Resolve

O comércio de produtos perecíveis (como ovos, laticínios e alimentos frescos) enfrenta desafios diários críticos:
1. **Desperdício por vencimento:** Produtos perdidos no estoque por falta de alerta visual claro sobre a data de validade.
2. **Ruptura de estoque:** Perder vendas porque o estoque acabou antes do pedido de reposição ser emitido.
3. **Falta de visibilidade financeira imediata:** Não saber com exatidão o faturamento diário, ticket médio e produto de maior saída no caixa.
4. **Dependência de internet:** Softwares em nuvem lentos ou que travam quando a conexão da loja falha.

Este sistema foi construído sob medida para rodar **100% offline**, de forma instantânea e com foco na agilidade do operador de estoque e caixa.

---

## ✨ Funcionalidades Principais

### 📊 1. Painel de Vendas & Indicadores Financeiros em Tempo Real
- **Faturamento Total:** Soma acumulada de todas as transações registradas.
- **Faturamento de Hoje:** Visão instantânea do fluxo financeiro do dia.
- **Itens Vendidos & Ticket Médio:** Indicadores essenciais para tomada de decisão.
- **Mais Vendido:** Destaque automático do produto campeão de saída.
- **Tabela de Últimas Vendas:** Histórico detalhado com data, hora, quantidades e valores.

### ⏳ 2. Painel de Alertas de Validade & Reposição
- **Monitor de Validade Inteligente:** Alerta preventivo com antecedência de 30 dias para produtos próximos de expirar.
- **Destaque Visual:** Badges dinâmicas coloridas:
  - 🟢 **OK:** Produto com prazo de validade em dia.
  - 🟡 **Atenção:** Produto perto de vencer (exibe contagem regressiva de dias).
  - 🔴 **Vencido:** Produto expirado (bloqueio automático de vendas para evitar incidentes).
- **Cálculo de Ponto de Reposição:** O sistema compara o estoque atual com o **Estoque Mínimo** e calcula automaticamente quantas unidades pedir até atingir o **Estoque Ideal**.

### 📦 3. Gestão Completa de Produtos (CRUD)
- Cadastro dinâmico com definição personalizada de **Estoque Mínimo** e **Estoque Ideal**.
- **Edição em 1 clique:** Altere preços, datas ou quantidades sem complicação.
- **Exclusão protegida:** Confirmação de segurança para evitar perda acidental de itens.
- **Ações rápidas na tabela:** Botões de `+ Entrada` e `- Venda` com quantidade customizável diretamente na linha do produto.

### 🔍 4. Busca Instantânea & Filtros por Status
- Pesquisa em tempo real pelo nome do produto.
- Filtros rápidos por botão:
  - 📋 **Todos**
  - ⚠️ **Próximos de Vencer**
  - ⛔ **Vencidos**
  - 📉 **Reposição Necessária**

### 💾 5. Segurança, Backup & Exportação
- **Backup em JSON:** Baixe uma cópia completa dos seus dados com um único clique.
- **Restauração Segura:** Importe backups a qualquer momento com sanitização automática de dados.
- **Exportação para Excel (CSV):** Relatório de vendas formatado para o padrão brasileiro (`pt-BR`) com compatibilidade total para planilhas.

---

## 🛠️ Tecnologias Utilizadas

- **[Electron](https://www.electronjs.org/):** Framework para empacotamento da aplicação Desktop multiplataforma.
- **JavaScript (ES6+):** Lógica reativa, cálculos financeiros e manipulação dinâmica do DOM.
- **HTML5 & CSS3 Moderno:** Interface limpa, responsiva, com variáveis CSS, tipografia moderna e animações suaves de feedback (Toasts).
- **LocalStorage API:** Persistência de dados ultra-rápida e sem necessidade de configuração de servidores externos.
- **Node.js:** Ambiente de execução e automação de empacotamento.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Git instalado na máquina

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/sistema-estoque.git
   cd sistema-estoque
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie a aplicação:**
   ```bash
   npm start
   ```

---

## 📦 Como Gerar o Executável (.exe)

Para gerar o instalador/executável independente para Windows:

```bash
npm run empacotar
```

O executável pronto para distribuição será gerado na pasta `dist/SistemaEstoque-win32-x64/`.

---

## 📁 Estrutura de Arquivos

```text
├── index.html       # Estrutura semântica da aplicação e layout
├── style.css        # Estilos, variáveis, design system e animações
├── app.js           # Lógica de negócio, validações, cálculos e eventos
├── main.js          # Configuração e inicialização da janela Electron
├── package.json     # Metadados do projeto e scripts npm
└── README.md        # Documentação completa do projeto
```

---

## 💡 Roadmap & Próximos Passos
- [ ] Integração com mini-impressoras térmicas para impressão de comprovante não-fiscal (58mm/80mm).
- [ ] Suporte a leitor de código de barras USB/Bluetooth.
- [ ] Múltiplos lotes com diferentes validades por produto.
- [ ] Opção de banco de dados SQLite local ou sincronização em nuvem.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.
