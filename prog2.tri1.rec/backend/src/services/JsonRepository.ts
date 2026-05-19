import { join } from "path";
import { Convidado } from "../models/Convidado";

// Service: responsável exclusivamente pela leitura e escrita do JSON
export class JsonRepository {
  private filePath: string;

  constructor() {
    // Resolve o caminho do dados.json relativo à raiz do projeto
    this.filePath = join(import.meta.dir, "../../../dados.json");
  }

  async lerTodos(): Promise<Convidado[]> {
    try {
      const file = Bun.file(this.filePath);
      const exists = await file.exists();
      if (!exists) {
        throw new Error("Arquivo dados.json não encontrado.");
      }
      const raw = await file.json() as { nome: string; confirmado: boolean; acompanhantes: number }[];
      return raw.map((item) => Convidado.fromJSON(item));
    } catch (error) {
      throw new Error(`Erro ao ler dados.json: ${(error as Error).message}`);
    }
  }

  async salvarTodos(convidados: Convidado[]): Promise<void> {
    try {
      const dados = JSON.stringify(convidados.map((c) => c.toJSON()), null, 2);
      await Bun.write(this.filePath, dados);
    } catch (error) {
      throw new Error(`Erro ao salvar dados.json: ${(error as Error).message}`);
    }
  }
}
