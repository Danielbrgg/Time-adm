const form = document.querySelector("form")
const productTableBody = document.getElementById("productTableBody")
const productPlaceholder = document.querySelector(".produtoPalceholder")
let produtos = []

form.addEventListener("submit", e => {
    e.preventDefault()

    const formData = new FormData(form)

    const produto = new Produto({
        produto: formData.get("produto"),
        valorUnitario: Number(formData.get("valor")),
        unidade: formData.get("unidade"),
        tipoProduto: formData.get("tipo")
    })

    produto.calcularValorTotal()
    produto.calcularValorImposto()
    produto.calcularValorFinal()

    produtos.push(produto)

    saveProduto(produto)

    form.reset()
})

function saveProduto(produto) {
    if (productTableBody.contains(productPlaceholder)) {
        productTableBody.removeChild(productPlaceholder)
    }

    const tr = document.createElement("tr")
    const Produto = document.createElement("td")
    const ValorUnitario = document.createElement("td")
    const Unidade = document.createElement("td")
    const quantidadeTd = document.createElement("td")
    const quantidade = document.createElement("input")
    const ValorTotal = document.createElement("td")
    const ValorImposto = document.createElement("td")
    const ValorFinal = document.createElement("td")
    const Remover = document.createElement("td")

    Produto.innerHTML = produto.produto
    ValorUnitario.innerHTML = numberToReal(produto.valorUnitario)
    Unidade.innerHTML = produto.unidade
    quantidade.value = produto.qtd

    Remover.innerHTML = "x"
    Remover.classList.add("td-remover")

    Remover.addEventListener("click", () => {
        productTableBody.removeChild(tr)

        const index = produtos.indexOf(produto)
        if (index > -1) {
            produtos.splice(index, 1)
        }

        if (produtos.length === 0) {
            productTableBody.appendChild(productPlaceholder)
        }
    })

    quantidade.type = "number"
    quantidadeTd.appendChild(quantidade)

    produto.calcularValorTotal()
    formatarValor()

    quantidade.addEventListener("input", () => {
        produto.qtd = Number(quantidade.value) || 0

        produto.calcularValorTotal()
        produto.calcularValorImposto()
        produto.calcularValorFinal()

        formatarValor()
    })

    function formatarValor() {
        ValorTotal.innerHTML = numberToReal(produto.valorTotal)
        ValorImposto.innerHTML = numberToReal(produto.valorImposto)
        ValorFinal.innerHTML = numberToReal(produto.valorFinal)
    }

    tr.appendChild(Produto)
    tr.appendChild(ValorUnitario)
    tr.appendChild(Unidade)
    tr.appendChild(quantidadeTd)
    tr.appendChild(ValorTotal)
    tr.appendChild(ValorImposto)
    tr.appendChild(ValorFinal)
    tr.appendChild(Remover)

    productTableBody.appendChild(tr)
}

class Produto {
    produto
    valorUnitario
    unidade
    tipoProduto
    qtd
    valorTotal
    valorImposto
    valorFinal

    constructor({ produto, valorUnitario, unidade, tipoProduto }) {
        this.produto = produto
        this.valorUnitario = valorUnitario
        this.unidade = unidade
        this.tipoProduto = tipoProduto
        this.qtd = 1
    }

    calcularValorTotal() {
        this.valorTotal = this.valorUnitario * this.qtd
    }

    calcularValorImposto() {
        switch (this.tipoProduto) {
            case "1":
                this.valorImposto = 0
                break
            case "2":
                this.valorImposto = this.valorTotal * 0.08
                break
            case "3":
                this.valorImposto = this.valorTotal * 0.1
                break
            case "4":
                this.valorImposto = this.valorTotal * 0.12
                break
            case "5":
                this.valorImposto = this.valorTotal * 0.17
                break
        }
    }

    calcularValorFinal() {
        this.valorFinal = this.valorTotal + this.valorImposto
    }
}

function numberToReal(numero) {
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}