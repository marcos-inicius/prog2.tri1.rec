import { ConvidadoController } from "../controllers/ConvidadoController";

type RouteHandler = (req: Request) => Promise<Response>;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

// Router: registra e despacha as rotas da aplicação
export class Router {
  private routes: Route[] = [];
  private controller: ConvidadoController;

  constructor() {
    this.controller = new ConvidadoController();
    this.registrarRotas();
  }

  private registrarRotas(): void {
    this.add("GET", "/api/convidados/buscar", (req) => this.controller.buscar(req));
    this.add("POST", "/api/convidados/confirmar", (req) => this.controller.confirmar(req));
    this.add("POST", "/api/convidados/cancelar", (req) => this.controller.cancelar(req));
    this.add("GET", "/api/estatisticas", (req) => this.controller.estatisticas(req));
  }

  private add(method: string, path: string, handler: RouteHandler): void {
    this.routes.push({ method, path, handler });
  }

  async despachar(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Preflight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const rota = this.routes.find(
      (r) => r.method === req.method && r.path === pathname
    );

    if (!rota) {
      return new Response(JSON.stringify({ erro: "Rota não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return rota.handler(req);
  }
}
