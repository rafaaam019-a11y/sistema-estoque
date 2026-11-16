const CHAVE = "estoque-dados";
const DIAS_AVISO = 30;

// Dados iniciais sincronizados com dados.json (usados caso o localStorage esteja vazio)
const DADOS_INICIAIS = {
  produtos: [
    {
      id: 1,
      nome: "Ovo branco (dúzia)",
      preco: 12.5,
      quantidade: 35,
      validade: "2026-12-10",
      estoqueMinimo: 8,
      estoqueIdeal: 40,
    },
    {
      id: 2,
      nome: "Ovo caipira (dúzia)",
      preco: 18.0,
      quantidade: 26,
      validade: "2026-12-05",
      estoqueMinimo: 8,
      estoqueIdeal: 40,
    },
    {
      id: 3,
      nome: "Leite integral 1L",
      preco: 5.9,
      quantidade: 5,
      validade: "2026-11-20",
      estoqueMinimo: 8,
      estoqueIdeal: 40,
    },
    {
      id: 4,
      nome: "Ovo de codorna",
      preco: 9.0,
      quantidade: 5,
      validade: "2026-11-10",
      estoqueMinimo: 8,
      estoqueIdeal: 40,
    },
  ],
  vendas: [
    {
      produtoId: 1,
      nome: "Ovo branco (dúzia)",
      quantidade: 10,
      precoUnitario: 12.5,
      total: 125,
      data: "2026-11-15T01:44:50.594Z",
    },
    {
      produtoId: 1,
      nome: "Ovo branco (dúzia)",
      quantidade: 5,
      precoUnitario: 12.5,
      total: 62.5,
      data: "2026-11-15T01:44:50.611Z",
    },
    {
      produtoId: 2,
      nome: "Ovo caipira (dúzia)",
      quantidade: 4,
      precoUnitario: 18,
      total: 72,
      data: "2026-11-15T01:44:50.614Z",
    },
    {
      produtoId: 3,
      nome: "Leite integral 1L",
      quantidade: 35,
      precoUnitario: 5.9,
      total: 206.5,
      data: "2026-11-15T01:44:50.618Z",
    },
    {
      produtoId: 4,
      nome: "Ovo de codorna",
      quantidade: 15,
      precoUnitario: 9,
      total: 135,
      data: "2026-11-15T01:44:50.631Z",
    },
  ],
};

let produtos = [];
let vendas = [];
let filtroAtivo = "todos";
let termoBusca = "";

/* ==========================================
   Persistência e Migração de Dados
   ========================================== */
function salvarDados() {
  try {
    const dados = { produtos, vendas };
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch (erro) {
    console.error("Erro ao salvar dados no localStorage:", erro);
    mostrarToast("Erro ao gravar dados no armazenamento local!", "erro");
  }
}

function carregarDados() {
  const texto = localStorage.getItem(CHAVE);

  if (texto === null) {
    // Primeira execução: migra automaticamente os dados existentes do dados.json
    produtos = JSON.parse(JSON.stringify(DADOS_INICIAIS.produtos));
    vendas = JSON.parse(JSON.stringify(DADOS_INICIAIS.vendas));
    salvarDados();
    return;
  }

  try {
    const dados = JSON.parse(texto);
    produtos = Array.isArray(dados.produtos) ? dados.produtos : [];
    vendas = Array.isArray(dados.vendas) ? dados.vendas : [];
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    produtos = [];
    vendas = [];
  }
}

/* ==========================================
   Utilitários e Formatação
   ========================================== */
function proximoId() {
  if (produtos.length === 0) return 1;
  return Math.max(...produtos.map((p) => Number(p.id) || 0)) + 1;
}

function normalizarData(validade) {
  if (!validade) return null;
  if (validade instanceof Date) return validade;
  if (typeof validade === "string") {
    if (validade.length === 10 && validade.includes("-")) {
      return new Date(validade + "T00:00:00");
    }
    return new Date(validade);
  }
  return new Date(validade);
}

function diasParaVencer(validade) {
  const data = normalizarData(validade);
  if (!data || isNaN(data.getTime())) return 0;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataAlvo = new Date(data);
  dataAlvo.setHours(0, 0, 0, 0);

  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((dataAlvo - hoje) / msPorDia);
}

function formatarData(validade) {
  const data = normalizarData(validade);
  if (!data || isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
}

function formatarDataInput(validade) {
  const data = normalizarData(validade);
  if (!data || isNaN(data.getTime())) return "";
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarMoeda(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function mostrarToast(mensagem, tipo = "sucesso") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;

  let icone = "✅";
  if (tipo === "alerta") icone = "⚠️";
  if (tipo === "erro") icone = "⛔";

  toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================
   Operações de Produtos (CRUD)
   ========================================== */
function cadastrarOuAtualizarProduto(idEdicao, nome, preco, quantidade, validade, estoqueMinimo, estoqueIdeal) {
  const precoValido = Number(preco);
  const qtdValida = parseInt(quantidade, 10);
  const minValido = Math.max(1, parseInt(estoqueMinimo, 10) || 8);
  const idealValido = Math.max(minValido, parseInt(estoqueIdeal, 10) || 40);

  if (isNaN(precoValido) || precoValido <= 0) {
    mostrarToast("Preço deve ser um valor maior que zero!", "alerta");
    return;
  }

  if (isNaN(qtdValida) || qtdValida < 0) {
    mostrarToast("Quantidade não pode ser negativa!", "alerta");
    return;
  }

  if (idEdicao) {
    const produto = buscarProduto(Number(idEdicao));
    if (produto) {
      produto.nome = nome;
      produto.preco = precoValido;
      produto.quantidade = qtdValida;
      produto.validade = validade;
      produto.estoqueMinimo = minValido;
      produto.estoqueIdeal = idealValido;
      mostrarToast(`Produto "${nome}" atualizado com sucesso!`);
    }
  } else {
    const novoProduto = {
      id: proximoId(),
      nome,
      preco: precoValido,
      quantidade: qtdValida,
      validade,
      estoqueMinimo: minValido,
      estoqueIdeal: idealValido,
    };
    produtos.push(novoProduto);
    mostrarToast(`"${nome}" cadastrado com sucesso!`);
  }

  cancelarEdicao();
  salvarDados();
  mostrarEstoque();
}

function iniciarEdicao(id) {
  const produto = buscarProduto(id);
  if (!produto) return;

  document.getElementById("produto-id-edicao").value = produto.id;
  document.getElementById("nome").value = produto.nome;
  document.getElementById("preco").value = produto.preco;
  document.getElementById("quantidade").value = produto.quantidade;
  document.getElementById("validade").value = formatarDataInput(produto.validade);
  document.getElementById("estoque-minimo").value = produto.estoqueMinimo ?? 8;
  document.getElementById("estoque-ideal").value = produto.estoqueIdeal ?? 40;

  document.getElementById("form-titulo").textContent = `Editar Produto: ${produto.nome}`;
  document.getElementById("btn-submit-form").textContent = "Salvar Alterações";
  document.getElementById("btn-cancelar-edicao").style.display = "inline-flex";
  document.getElementById("badge-modo").style.display = "inline-flex";

  const secaoForm = document.getElementById("secao-formulario");
  secaoForm.scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicao() {
  document.getElementById("form-produto").reset();
  document.getElementById("produto-id-edicao").value = "";
  document.getElementById("estoque-minimo").value = 8;
  document.getElementById("estoque-ideal").value = 40;

  document.getElementById("form-titulo").textContent = "Cadastrar Novo Produto";
  document.getElementById("btn-submit-form").textContent = "Cadastrar Produto";
  document.getElementById("btn-cancelar-edicao").style.display = "none";
  document.getElementById("badge-modo").style.display = "none";
}

function excluirProduto(id) {
  const produto = buscarProduto(id);
  if (!produto) return;

  const confirmar = confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`);
  if (!confirmar) return;

  produtos = produtos.filter((p) => p.id !== id);
  salvarDados();
  mostrarEstoque();
  mostrarToast(`Produto "${produto.nome}" foi removido.`, "alerta");
}

function buscarProduto(id) {
  return produtos.find((p) => p.id === id);
}

function registrarEntrada(id, quantidade) {
  const produto = buscarProduto(id);
  if (!produto) {
    mostrarToast("Produto não encontrado!", "erro");
    return;
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    mostrarToast("Informe uma quantidade inteira válida!", "alerta");
    return;
  }

  produto.quantidade += quantidade;
  salvarDados();
  mostrarEstoque();
  mostrarToast(`Entrada confirmada: +${quantidade} de ${produto.nome}`);
}

function registrarSaida(id, quantidade) {
  const produto = buscarProduto(id);
  if (!produto) {
    mostrarToast("Produto não encontrado!", "erro");
    return;
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    mostrarToast("Informe uma quantidade inteira válida!", "alerta");
    return;
  }

  if (diasParaVencer(produto.validade) < 0) {
    mostrarToast(`"${produto.nome}" está vencido! Não pode ser vendido.`, "erro");
    return;
  }

  if (quantidade > produto.quantidade) {
    mostrarToast(`Estoque insuficiente! Disponível: apenas ${produto.quantidade}.`, "alerta");
    return;
  }

  produto.quantidade -= quantidade;
  const valorTotal = produto.preco * quantidade;

  vendas.push({
    produtoId: produto.id,
    nome: produto.nome,
    quantidade,
    precoUnitario: produto.preco,
    total: valorTotal,
    data: new Date().toISOString(),
  });

  salvarDados();
  mostrarEstoque();
  mostrarToast(`Venda registrada: -${quantidade} ${produto.nome} (${formatarMoeda(valorTotal)})`);
}

/* ==========================================
   Renderização da Interface
   ========================================== */
function criarItemAviso(texto, classe) {
  const li = document.createElement("li");
  li.textContent = texto;
  li.classList.add(classe);
  return li;
}

function mostrarAvisos() {
  const listaValidade = document.getElementById("lista-validade");
  const listaReposicao = document.getElementById("lista-reposicao");

  listaValidade.innerHTML = "";
  listaReposicao.innerHTML = "";

  for (const p of produtos) {
    const dias = diasParaVencer(p.validade);

    if (dias < 0) {
      listaValidade.appendChild(
        criarItemAviso(
          `${p.nome} venceu há ${Math.abs(dias)} dia(s) (${formatarData(p.validade)})`,
          "vencido"
        )
      );
    } else if (dias <= DIAS_AVISO) {
      listaValidade.appendChild(
        criarItemAviso(
          `${p.nome} vence em ${dias} dia(s) (${formatarData(p.validade)})`,
          "atencao"
        )
      );
    }

    const min = p.estoqueMinimo ?? 8;
    const ideal = p.estoqueIdeal ?? 40;

    if (p.quantidade <= min) {
      const pedir = Math.max(ideal - p.quantidade, 0);
      listaReposicao.appendChild(
        criarItemAviso(
          `${p.nome}: atual ${p.quantidade} un. (mínimo ${min}) ➔ pedir ${pedir}`,
          "atencao"
        )
      );
    }
  }

  if (listaValidade.children.length === 0) {
    listaValidade.appendChild(
      criarItemAviso("Todos os produtos estão com prazo de validade em dia.", "sem-aviso")
    );
  }

  if (listaReposicao.children.length === 0) {
    listaReposicao.appendChild(
      criarItemAviso("Estoque abastecido. Nenhum produto precisa de reposição.", "sem-aviso")
    );
  }
}

function criarCelulaAcoes(produto) {
  const td = document.createElement("td");
  td.classList.add("acoes");

  const campo = document.createElement("input");
  campo.type = "number";
  campo.min = "1";
  campo.value = "1";

  const btnEntrada = document.createElement("button");
  btnEntrada.textContent = "+ Entrada";
  btnEntrada.className = "btn-entrada";
  btnEntrada.title = "Dar entrada de novos itens";
  btnEntrada.onclick = () => {
    registrarEntrada(produto.id, Number(campo.value));
  };

  const btnVenda = document.createElement("button");
  btnVenda.textContent = "- Venda";
  btnVenda.className = "btn-venda";
  btnVenda.title = "Registrar venda";
  btnVenda.onclick = () => {
    registrarSaida(produto.id, Number(campo.value));
  };

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "✏️";
  btnEditar.className = "btn-editar";
  btnEditar.title = "Editar dados do produto";
  btnEditar.onclick = () => iniciarEdicao(produto.id);

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "🗑️";
  btnExcluir.className = "btn-excluir";
  btnExcluir.title = "Excluir produto";
  btnExcluir.onclick = () => excluirProduto(produto.id);

  td.appendChild(campo);
  td.appendChild(btnEntrada);
  td.appendChild(btnVenda);
  td.appendChild(btnEditar);
  td.appendChild(btnExcluir);

  return td;
}

function obterSituacaoBadge(produto) {
  const dias = diasParaVencer(produto.validade);
  const span = document.createElement("span");
  span.className = "badge";

  if (dias < 0) {
    span.classList.add("badge-vencido");
    span.textContent = `Vencido há ${Math.abs(dias)}d`;
  } else if (dias <= DIAS_AVISO) {
    span.classList.add("badge-atencao");
    span.textContent = `Vence em ${dias}d`;
  } else {
    span.classList.add("badge-ok");
    span.textContent = `OK (${dias}d)`;
  }
  return span;
}

function filtrarProdutos() {
  return produtos.filter((p) => {
    // Filtro por nome
    if (termoBusca && !p.nome.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }

    const dias = diasParaVencer(p.validade);
    const min = p.estoqueMinimo ?? 8;

    if (filtroAtivo === "atencao") {
      return dias >= 0 && dias <= DIAS_AVISO;
    }
    if (filtroAtivo === "vencidos") {
      return dias < 0;
    }
    if (filtroAtivo === "repor") {
      return p.quantidade <= min;
    }

    return true;
  });
}

function mostrarEstoque() {
  const tabela = document.getElementById("tabela-estoque");
  const mensagemVazio = document.getElementById("msg-vazio");
  const contadorTotal = document.getElementById("total-itens-estoque");

  tabela.innerHTML = "";
  const listaFiltrada = filtrarProdutos();

  contadorTotal.textContent = `${produtos.length} produto(s) cadastrado(s)`;
  mensagemVazio.hidden = listaFiltrada.length > 0;

  for (const p of listaFiltrada) {
    const linha = document.createElement("tr");
    const dias = diasParaVencer(p.validade);

    if (dias < 0) {
      linha.classList.add("linha-vencido");
    } else if (dias <= DIAS_AVISO) {
      linha.classList.add("linha-atencao");
    }

    const tdId = document.createElement("td");
    tdId.textContent = p.id;

    const tdNome = document.createElement("td");
    tdNome.innerHTML = `<strong>${p.nome}</strong>`;

    const tdPreco = document.createElement("td");
    tdPreco.textContent = formatarMoeda(p.preco);

    const tdQtd = document.createElement("td");
    const min = p.estoqueMinimo ?? 8;
    tdQtd.innerHTML = p.quantidade <= min 
      ? `<strong style="color: var(--warning);">${p.quantidade} ⚠️</strong>`
      : p.quantidade;

    const tdMinIdeal = document.createElement("td");
    tdMinIdeal.textContent = `${p.estoqueMinimo ?? 8} / ${p.estoqueIdeal ?? 40}`;

    const tdValidade = document.createElement("td");
    tdValidade.textContent = formatarData(p.validade);

    const tdSituacao = document.createElement("td");
    tdSituacao.appendChild(obterSituacaoBadge(p));

    linha.appendChild(tdId);
    linha.appendChild(tdNome);
    linha.appendChild(tdPreco);
    linha.appendChild(tdQtd);
    linha.appendChild(tdMinIdeal);
    linha.appendChild(tdValidade);
    linha.appendChild(tdSituacao);
    linha.appendChild(criarCelulaAcoes(p));

    tabela.appendChild(linha);
  }

  mostrarAvisos();
  mostrarVendas();
}

function mostrarVendas() {
  let faturamentoTotal = 0;
  let faturamentoHoje = 0;
  let itensVendidos = 0;
  const porProduto = {};
  const hoje = new Date().toLocaleDateString("pt-BR");

  for (const v of vendas) {
    faturamentoTotal += v.total;
    itensVendidos += v.quantidade;

    if (new Date(v.data).toLocaleDateString("pt-BR") === hoje) {
      faturamentoHoje += v.total;
    }

    porProduto[v.nome] = (porProduto[v.nome] || 0) + v.quantidade;
  }

  let maisVendido = "-";
  let maiorQuantidade = 0;

  for (const nome in porProduto) {
    if (porProduto[nome] > maiorQuantidade) {
      maiorQuantidade = porProduto[nome];
      maisVendido = `${nome} (${maiorQuantidade} un.)`;
    }
  }

  const ticketMedio = vendas.length > 0 ? faturamentoTotal / vendas.length : 0;

  document.getElementById("fat-total").textContent = formatarMoeda(faturamentoTotal);
  document.getElementById("fat-hoje").textContent = formatarMoeda(faturamentoHoje);
  document.getElementById("itens-vendidos").textContent = itensVendidos;
  document.getElementById("ticket-medio").textContent = formatarMoeda(ticketMedio);
  document.getElementById("mais-vendido").textContent = maisVendido;

  const tabelaVendas = document.getElementById("tabela-vendas");
  const mensagemSemVendas = document.getElementById("msg-sem-vendas");

  tabelaVendas.innerHTML = "";
  mensagemSemVendas.hidden = vendas.length > 0;

  const ultimas = vendas.slice().reverse().slice(0, 15);

  for (const v of ultimas) {
    const linha = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = new Date(v.data).toLocaleString("pt-BR");

    const tdNome = document.createElement("td");
    tdNome.textContent = v.nome;

    const tdQtd = document.createElement("td");
    tdQtd.textContent = v.quantidade;

    const tdUnit = document.createElement("td");
    tdUnit.textContent = formatarMoeda(v.precoUnitario);

    const tdTotal = document.createElement("td");
    tdTotal.innerHTML = `<strong>${formatarMoeda(v.total)}</strong>`;

    linha.appendChild(tdData);
    linha.appendChild(tdNome);
    linha.appendChild(tdQtd);
    linha.appendChild(tdUnit);
    linha.appendChild(tdTotal);

    tabelaVendas.appendChild(linha);
  }
}

/* ==========================================
   Importação e Exportação (Backup & CSV)
   ========================================== */
function exportarDadosJSON() {
  const dados = { produtos, vendas };
  const str = JSON.stringify(dados, null, 2);
  const blob = new Blob([str], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const hoje = new Date().toISOString().slice(0, 10);
  a.download = `backup-mister-egg-${hoje}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast("Backup JSON gerado com sucesso!");
}

function importarDadosJSON(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = function (e) {
    try {
      const dados = JSON.parse(e.target.result);
      if (dados && Array.isArray(dados.produtos)) {
        produtos = dados.produtos.map((p, index) => ({
          id: Number(p.id) || index + 1,
          nome: String(p.nome || "Produto sem nome"),
          preco: Number(p.preco) || 0,
          quantidade: Math.max(0, parseInt(p.quantidade, 10) || 0),
          validade: p.validade || "",
          estoqueMinimo: Number(p.estoqueMinimo) || 8,
          estoqueIdeal: Number(p.estoqueIdeal) || 40,
        }));
        vendas = Array.isArray(dados.vendas) ? dados.vendas : [];
        salvarDados();
        mostrarEstoque();
        mostrarToast("Dados restaurados do arquivo JSON com sucesso!");
      } else {
        mostrarToast("Formato de arquivo JSON inválido!", "erro");
      }
    } catch (err) {
      mostrarToast("Erro ao processar o arquivo JSON.", "erro");
    }
  };
  leitor.readAsText(arquivo);
  evento.target.value = "";
}

function exportarVendasCSV() {
  if (vendas.length === 0) {
    mostrarToast("Nenhuma venda para exportar!", "alerta");
    return;
  }

  let csv = "\uFEFF"; // UTF-8 BOM para abrir acentos perfeitamente no Excel
  csv += "Data;Produto;Quantidade;Preco Unitario;Total\n";

  for (const v of vendas) {
    const dataFormatada = new Date(v.data).toLocaleString("pt-BR");
    const nome = `"${(v.nome || "").replace(/"/g, '""')}"`;
    const precoUnit = (v.precoUnitario || 0).toFixed(2).replace(".", ",");
    const total = (v.total || 0).toFixed(2).replace(".", ",");
    csv += `${dataFormatada};${nome};${v.quantidade};${precoUnit};${total}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const hoje = new Date().toISOString().slice(0, 10);
  a.download = `relatorio-vendas-${hoje}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast("Planilha CSV de vendas baixada!");
}

/* ==========================================
   Inicialização e Eventos
   ========================================== */
function iniciarSistema() {
  carregarDados();
  mostrarEstoque();

  // Formulário
  const formulario = document.getElementById("form-produto");
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const idEdicao = document.getElementById("produto-id-edicao").value;
    const nome = document.getElementById("nome").value.trim();
    const preco = Number(document.getElementById("preco").value);
    const quantidade = Number(document.getElementById("quantidade").value);
    const validade = document.getElementById("validade").value;
    const estoqueMinimo = Number(document.getElementById("estoque-minimo").value);
    const estoqueIdeal = Number(document.getElementById("estoque-ideal").value);

    if (!nome) {
      mostrarToast("Digite o nome do produto!", "alerta");
      return;
    }

    cadastrarOuAtualizarProduto(idEdicao, nome, preco, quantidade, validade, estoqueMinimo, estoqueIdeal);
  });

  document.getElementById("btn-cancelar-edicao").addEventListener("click", cancelarEdicao);

  // Busca
  const inputBusca = document.getElementById("filtro-busca");
  inputBusca.addEventListener("input", (e) => {
    termoBusca = e.target.value.trim();
    mostrarEstoque();
  });

  // Filtros rápidos
  const botoesFiltro = document.querySelectorAll(".btn-filtro");
  botoesFiltro.forEach((btn) => {
    btn.addEventListener("click", () => {
      botoesFiltro.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      filtroAtivo = btn.dataset.filtro;
      mostrarEstoque();
    });
  });

  // Backup e Importação
  document.getElementById("btn-exportar").addEventListener("click", exportarDadosJSON);
  document.getElementById("btn-acionar-importar").addEventListener("click", () => {
    document.getElementById("input-importar").click();
  });
  document.getElementById("input-importar").addEventListener("change", importarDadosJSON);
  document.getElementById("btn-exportar-csv").addEventListener("click", exportarVendasCSV);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarSistema);
} else {
  iniciarSistema();
}
