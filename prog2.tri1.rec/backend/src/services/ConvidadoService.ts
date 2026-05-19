import { Convidado } from "../models/Convidado";
import { Estatisticas } from "../models/Estatisticas";
import { JsonRepository } from "./JsonRepository";

// Service: contém toda a lógica de negócio relacionada a convidados
export class ConvidadoService {
  private repository: JsonRepository;

  constructor() {
    this.repository = new JsonRepository();
  }

  async buscarPorNome(termo: string): Promise<Convidado[]> {
    const todos = await this.repository.lerTodos();
    const termoNormalizado = termo.toLowerCase().trim();
    return todos.filter((c) =>
      c.nome.toLowerCase().includes(termoNormalizado)
    );
  }

  async confirmarPresenca(nome: string, acompanhantes: number): Promise<Convidado> {
    if (acompanhantes < 0) {
      throw new Error("Acompanhantes não podem ser negativos.");
    }

    const todos = await this.repository.lerTodos();
    const index = todos.findIndex(
      (c) => c.nome.toLowerCase() === nome.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Convidado "${nome}" não encontrado.`);
    }

    todos[index].confirmarPresenca(acompanhantes);
    await this.repository.salvarTodos(todos);
    return todos[index];
  }

  async cancelarPresenca(nome: string): Promise<Convidado> {
    const todos = await this.repository.lerTodos();
    const index = todos.findIndex(
      (c) => c.nome.toLowerCase() === nome.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Convidado "${nome}" não encontrado.`);
    }

    todos[index].cancelarPresenca();
    await this.repository.salvarTodos(todos);
    return todos[index];
  }

  async obterEstatisticas(): Promise<Estatisticas> {
    const todos = await this.repository.lerTodos();
    const confirmados = todos.filter((c) => c.confirmado);
    const totalAcompanhantes = confirmados.reduce(
      (acc, c) => acc + c.acompanhantes,
      0
    );

    return new Estatisticas(
      todos.length,
      confirmados.length,
      todos.length - confirmados.length,
      totalAcompanhantes
    );
  }
}
