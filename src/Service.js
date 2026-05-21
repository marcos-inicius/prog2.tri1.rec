// src/Service.js

class Service {
  constructor(repository) {
    this.repository = repository;
  }

  buscar(termo) {
    const convidados = this.repository.ler();
    return convidados.filter(c =>
      c.nome.toLowerCase().includes(termo.toLowerCase())
    );
  }

  confirmar(nome, confirmado, acompanhantes) {
    if (!nome) throw new Error("Nome é obrigatório.");
    if (typeof confirmado !== "boolean") throw new Error("Informe se vai participar.");
    if (acompanhantes < 0) throw new Error("Acompanhantes não pode ser negativo.");

    const convidados = this.repository.ler();
    const indice = convidados.findIndex(
      c => c.nome.toLowerCase() === nome.toLowerCase()
    );

    if (indice === -1) throw new Error("Convidado não encontrado.");

    convidados[indice].confirmado = confirmado;
    convidados[indice].acompanhantes = Number(acompanhantes);
    this.repository.salvar(convidados);

    return convidados[indice];
  }

  estatisticas() {
    const convidados = this.repository.ler();
    const total = convidados.length;
    const confirmados = convidados.filter(c => c.confirmado).length;
    const ausentes = total - confirmados;
    const acompanhantes = convidados.reduce((soma, c) => soma + c.acompanhantes, 0);
    return { total, confirmados, ausentes, acompanhantes };
  }
}

module.exports = Service;
