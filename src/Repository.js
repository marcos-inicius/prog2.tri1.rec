// src/Repository.js
const fs = require("fs");

class Repository {
  constructor(caminho) {
    this.caminho = caminho;
  }

  ler() {
    const conteudo = fs.readFileSync(this.caminho, "utf-8");
    return JSON.parse(conteudo);
  }

  salvar(dados) {
    fs.writeFileSync(this.caminho, JSON.stringify(dados, null, 2), "utf-8");
  }
}

module.exports = Repository;
