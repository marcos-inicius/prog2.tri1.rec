import { Router } from "./routes/Router";

const PORT = 3000;
const router = new Router();

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    return router.despachar(req);
  },
});

console.log(`✅ Servidor rodando em http://localhost:${server.port}`);
console.log(`📁 Arquivo de dados: dados.json`);
console.log(`📡 Rotas disponíveis:`);
console.log(`   GET  /api/convidados/buscar?q=<termo>`);
console.log(`   POST /api/convidados/confirmar`);
console.log(`   POST /api/convidados/cancelar`);
console.log(`   GET  /api/estatisticas`);
