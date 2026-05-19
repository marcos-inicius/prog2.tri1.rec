// Model: representa as estatísticas do evento
export class Estatisticas {
  totalConvidados: number;
  totalConfirmados: number;
  totalAusentes: number;
  totalAcompanhantes: number;

  constructor(
    totalConvidados: number,
    totalConfirmados: number,
    totalAusentes: number,
    totalAcompanhantes: number
  ) {
    this.totalConvidados = totalConvidados;
    this.totalConfirmados = totalConfirmados;
    this.totalAusentes = totalAusentes;
    this.totalAcompanhantes = totalAcompanhantes;
  }

  toJSON(): object {
    return {
      totalConvidados: this.totalConvidados,
      totalConfirmados: this.totalConfirmados,
      totalAusentes: this.totalAusentes,
      totalAcompanhantes: this.totalAcompanhantes,
    };
  }
}
