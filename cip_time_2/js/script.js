const form = document.querySelector("form")

form.addEventListener("submit", e => {
    e.preventDefault()

    const formData = new FormData(form)

    const produto = new Produto({
        produto: formData.get("produto"),
        valorUnitario: formData.get("valor"),
        unidade: formData.get("unidade"),
        tipoProduto: formData.get("tipo")
    })

    produto.calcularValorTotal()
    produto.calcularValorImposto()
    produto.calcularValorFinal()

    form.reset()
})

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