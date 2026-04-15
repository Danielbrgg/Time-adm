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
})

class Produto {
    constructor({ produto, valorUnitario, unidade, tipoProduto }) {
        this.produto = produto
        this.valorUnitario = valorUnitario
        this.unidade = unidade
        this.tipoProduto = tipoProduto
        this.qtd = 1
    }
}
