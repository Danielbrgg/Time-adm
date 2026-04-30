const productTableBody = document.getElementById("productTableBody");
const form = document.querySelector("form");
const productPlaceholder = document.querySelector(".produtoPalceholder");
const button = document.querySelector("button");
const apiUrl = "http://10.231.32.35:8081/produtos";
let produtos = [];

let formUpdate = false;
let editingId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const produto = new Produto({
    produto: formData.get("produto"),
    caracteristicas: formData.get("carac"),
    valorUnitario: Number(formData.get("valor")),
    unidade: formData.get("unidade"),
    tipoProduto: formData.get("tipo"),
  });

  const info = {
    nome: produto.produto,
    caracteristicas: produto.caracteristicas,
    valorUnd: produto.valorUnitario,
    und: produto.unidade,
    tipo: produto.tipoProduto,
    qtd: produto.qtd,
  };

  if (formUpdate && editingId != null) {
    formUpdate = false;
    button.innerHTML = "Enviar";
    await preencherFormulario(editingId, info);
    form.reset();
    editingId = null;
    return;
  }

  const response = await fetch(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(info),
  });

  try {
    const data = await response.json();
    produto.id = data.id;

    produto.calcularValorTotal();
    produto.calcularValorImposto();
    produto.calcularValorFinal();

    saveProduto(produto);
  } catch (error) {
    alert("Erro ao adicionar produto. Por favor, tente novamente.");
    console.error(error);
  }

  form.reset();
});

async function preencherFormulario(id, info) {
  const response = await fetch(apiUrl + `/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info)
  });

  if (response.ok) {
    const produto = produtos.find(p => p.id == id);

    produto.produto = info.nome;
    produto.caracteristicas = info.caracteristicas;
    produto.valorUnitario = info.valorUnd;
    produto.unidade = info.und;
    produto.tipoProduto = info.tipo;

    produto.calcularValorTotal();
    produto.calcularValorImposto();
    produto.calcularValorFinal();

    const tr = document.getElementById(id);

    tr.children[0].innerHTML = produto.produto;
    tr.children[1].innerHTML = numberToReal(produto.valorUnitario);
    tr.children[2].innerHTML = produto.unidade;
    tr.children[3].children[0].value = produto.qtd;
    tr.children[4].innerHTML = numberToReal(produto.valorTotal);
    tr.children[5].innerHTML = numberToReal(produto.valorImposto);
    tr.children[6].innerHTML = numberToReal(produto.valorFinal);
  } else {
    alert("Erro ao atualizar produto. Por favor, tente novamente.");
  }
}

function saveProduto(produto) {
  if (productTableBody.contains(productPlaceholder)) {
    productTableBody.removeChild(productPlaceholder);
  }
  produtos.push(produto);

  const tr = document.createElement("tr");
  tr.id = produto.id;
  const nome = document.createElement("td");
  const ValorUnitario = document.createElement("td");
  const Unidade = document.createElement("td");
  const quantidadeTd = document.createElement("td");
  const quantidade = document.createElement("input");
  quantidade.min = 1;
  const ValorTotal = document.createElement("td");
  const ValorImposto = document.createElement("td");
  const ValorFinal = document.createElement("td");
  const Alterar = document.createElement("td");
  const Remover = document.createElement("td");

  nome.innerHTML = produto.produto;
  ValorUnitario.innerHTML = numberToReal(produto.valorUnitario);
  Unidade.innerHTML = produto.unidade;
  quantidade.value = produto.qtd;

  Alterar.innerHTML = "Alterar";
  Alterar.classList.add("td-alterar");

  Alterar.addEventListener("click", () => {
    if (formUpdate) {
      formUpdate = false;
      button.innerHTML = "Enviar";
      editingId = null;
      form.reset();
      return;
    }

    formUpdate = true;
    button.innerHTML = "Atualizar";

    form.elements["produto"].value = produto.produto;
    form.elements["carac"].value = produto.caracteristicas;
    form.elements["valor"].value = produto.valorUnitario;
    form.elements["unidade"].value = produto.unidade;
    form.elements["tipo"].value = produto.tipoProduto;
    editingId = produto.id;
  });

  Remover.innerHTML = "x";
  Remover.classList.add("td-remover");

  Remover.addEventListener("click", async () => {
    await fetch(apiUrl + `/${produto.id}`, {
      method: "DELETE"
    });

    productTableBody.removeChild(tr);

    const index = produtos.indexOf(produto);
    if (index > -1) {
      produtos.splice(index, 1);
    }

    if (produtos.length === 0) {
      productTableBody.appendChild(productPlaceholder);
    }
  });

  quantidade.type = "number";
  quantidadeTd.appendChild(quantidade);

  produto.calcularValorTotal();
  formatarValor();

  quantidade.addEventListener("input", async () => {
    produto.qtd = Number(quantidade.value) || 0;

    produto.calcularValorTotal();
    produto.calcularValorImposto();
    produto.calcularValorFinal();

    const response = await fetch(apiUrl + `/${produto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qtd: produto.qtd })
    });

    if (!response.ok) {
      console.error(response);
    }

    formatarValor();
  });

  function formatarValor() {
    ValorTotal.innerHTML = numberToReal(produto.valorTotal);
    ValorImposto.innerHTML = numberToReal(produto.valorImposto);
    ValorFinal.innerHTML = numberToReal(produto.valorFinal);
  }

  tr.appendChild(nome);
  tr.appendChild(ValorUnitario);
  tr.appendChild(Unidade);
  tr.appendChild(quantidadeTd);
  tr.appendChild(ValorTotal);
  tr.appendChild(ValorImposto);
  tr.appendChild(ValorFinal);
  tr.appendChild(Alterar);
  tr.appendChild(Remover);

  productTableBody.appendChild(tr);
}

class Produto {
  id;
  produto;
  caracteristicas;
  valorUnitario;
  unidade;
  tipoProduto;
  qtd;
  valorTotal;
  valorImposto;
  valorFinal;

  constructor({ produto, caracteristicas, valorUnitario, unidade, tipoProduto }) {
    this.produto = produto;
    this.caracteristicas = caracteristicas;
    this.valorUnitario = valorUnitario;
    this.unidade = unidade;
    this.tipoProduto = tipoProduto;
    this.qtd = 1;
  }

  calcularValorTotal() {
    this.valorTotal = this.valorUnitario * this.qtd;
  }

  calcularValorImposto() {
    switch (this.tipoProduto) {
      case "1":
        this.valorImposto = 0;
        break;
      case "2":
        this.valorImposto = this.valorTotal * 0.08;
        break;
      case "3":
        this.valorImposto = this.valorTotal * 0.1;
        break;
      case "4":
        this.valorImposto = this.valorTotal * 0.12;
        break;
      case "5":
        this.valorImposto = this.valorTotal * 0.17;
        break;
    }
  }

  calcularValorFinal() {
    this.valorFinal = this.valorTotal + this.valorImposto;
  }
}

function numberToReal(numero) {
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function loadProdutos() {
  const response = await fetch(apiUrl);
  const data = await response.json();

  data.forEach((e) => {
    const produto = new Produto({
      produto: e.nome,
      caracteristicas: e.caracteristicas,
      valorUnitario: e.valorUnd,
      unidade: e.und,
      tipoProduto: e.tipo
    });

    produto.qtd = e.qtd;
    produto.id = e.id;

    produto.calcularValorTotal();
    produto.calcularValorImposto();
    produto.calcularValorFinal();

    saveProduto(produto);
  });
}

loadProdutos();