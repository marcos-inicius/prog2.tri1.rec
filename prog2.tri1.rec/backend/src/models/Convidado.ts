// Model: representa um convidado do evento
export class Convidado {
  nome: string;
  confirmado: boolean;
  acompanhantes: number;

  constructor(nome: string, confirmado: boolean = false, acompanhantes: number = 0) {
    this.nome = nome;
    this.confirmado = confirmado;
    this.acompanhantes = acompanhantes;
  }

  confirmarPresenca(acompanhantes: number): void {
    if (acompanhantes < 0) {
      throw new Error("Número de acompanhantes não pode ser negativo.");
    }
    this.confirmado = true;
    this.acompanhantes = acompanhantes;
  }

  cancelarPresenca(): void {
    this.confirmado = false;
    this.acompanhantes = 0;
  }

  toJSON(): object {
    return {
      nome: this.nome,
      confirmado: this.confirmado,
      acompanhantes: this.acompanhantes,
    };
  }

  static fromJSON(data: { nome: string; confirmado: boolean; acompanhantes: number }): Convidado {
    return new Convidado(data.nome, data.confirmado, data.acompanhantes);
  }
}
