// src/Controller.js

class Controller {
  constructor(service) {
    this.service = service;
  }

  responder(status, dados) {
    return new Response(JSON.stringify(dados), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  async buscar(req) {
    const url   = new URL(req.url);
    const termo = url.searchParams.get("q") || "";
    try {
      const resultado = this.service.buscar(termo);
      return this.responder(200, resultado);
    } catch (e) {
      return this.responder(400, { erro: e.message });
    }
  }

  async confirmar(req) {
    try {
      const corpo     = await req.json();
      const atualizado = this.service.confirmar(
        corpo.nome,
        corpo.confirmado,
        corpo.acompanhantes
      );
      return this.responder(200, atualizado);
    } catch (e) {
      return this.responder(400, { erro: e.message });
    }
  }

  async estatisticas(req) {
    try {
      const stats = this.service.estatisticas();
      return this.responder(200, stats);
    } catch (e) {
      return this.responder(500, { erro: e.message });
    }
  }
}

module.exports = Controller;
