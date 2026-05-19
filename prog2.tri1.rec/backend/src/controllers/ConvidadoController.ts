import { ConvidadoService } from "../services/ConvidadoService";

// Controller: faz a ponte entre as rotas HTTP e a lógica de negócio
export class ConvidadoController {
  private service: ConvidadoService;

  constructor() {
    this.service = new ConvidadoService();
  }

  async buscar(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const termo = url.searchParams.get("q") ?? "";

      if (!termo.trim()) {
        return this.json({ erro: "Parâmetro de busca não informado." }, 400);
      }

      const convidados = await this.service.buscarPorNome(termo);
      return this.json(convidados);
    } catch (error) {
      return this.json({ erro: (error as Error).message }, 500);
    }
  }

  async confirmar(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as { nome?: string; acompanhantes?: number };

      if (!body.nome || body.nome.trim() === "") {
        return this.json({ erro: "Nome do convidado é obrigatório." }, 400);
      }

      if (body.acompanhantes === undefined || body.acompanhantes === null) {
        return this.json({ erro: "Quantidade de acompanhantes é obrigatória." }, 400);
      }

      if (typeof body.acompanhantes !== "number" || !Number.isInteger(body.acompanhantes)) {
        return this.json({ erro: "Acompanhantes deve ser um número inteiro." }, 400);
      }

      if (body.acompanhantes < 0) {
        return this.json({ erro: "Acompanhantes não podem ser negativos." }, 400);
      }

      const convidado = await this.service.confirmarPresenca(body.nome, body.acompanhantes);
      return this.json({ mensagem: "Presença confirmada com sucesso!", convidado });
    } catch (error) {
      return this.json({ erro: (error as Error).message }, 400);
    }
  }

  async cancelar(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as { nome?: string };

      if (!body.nome || body.nome.trim() === "") {
        return this.json({ erro: "Nome do convidado é obrigatório." }, 400);
      }

      const convidado = await this.service.cancelarPresenca(body.nome);
      return this.json({ mensagem: "Presença cancelada.", convidado });
    } catch (error) {
      return this.json({ erro: (error as Error).message }, 400);
    }
  }

  async estatisticas(_req: Request): Promise<Response> {
    try {
      const stats = await this.service.obterEstatisticas();
      return this.json(stats);
    } catch (error) {
      return this.json({ erro: (error as Error).message }, 500);
    }
  }

  private json(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}
