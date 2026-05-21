// server.js
const path = require("path");
const fs   = require("fs");

const Repository = require("./src/Repository");
const Service    = require("./src/Service");
const Controller = require("./src/Controller");

const repositorio = new Repository(path.join(__dirname, "dados.json"));
const servico     = new Service(repositorio);
const controlador = new Controller(servico);

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url  = new URL(req.url);
    const rota = url.pathname;

    // API
    if (rota === "/api/buscar" && req.method === "GET") {
      return controlador.buscar(req);
    }
    if (rota === "/api/confirmar" && req.method === "POST") {
      return controlador.confirmar(req);
    }
    if (rota === "/api/estatisticas" && req.method === "GET") {
      return controlador.estatisticas(req);
    }

    // Arquivos estáticos
    let arquivo = rota === "/" ? "/index.html" : rota;
    const caminho = path.join(__dirname, "frontend", arquivo);

    try {
      const conteudo = fs.readFileSync(caminho);
      const ext  = path.extname(caminho);
      const tipo = ext === ".css" ? "text/css"
                 : ext === ".js"  ? "application/javascript"
                 : "text/html";
      return new Response(conteudo, { headers: { "Content-Type": tipo } });
    } catch {
      return new Response("Não encontrado.", { status: 404 });
    }
  },
});

console.log("Servidor rodando em http://localhost:" + server.port);
