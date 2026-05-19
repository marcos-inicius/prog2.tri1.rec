// ═══════════════════════════════════════════════
//  app.js — Front-end do Sistema de RSVP
//  Arquitetura OOP: ApiService, UIManager, SearchController, ConfirmController
// ═══════════════════════════════════════════════

const API_BASE = "http://localhost:3000/api";

// ──────────────────────────────────────────────
// 1. ApiService — comunicação com o back-end
// ──────────────────────────────────────────────
class ApiService {
  /**
   * Busca convidados por termo de pesquisa (parcial).
   * @param {string} termo
   * @returns {Promise<Array>}
   */
  async buscarConvidados(termo) {
    const res = await fetch(`${API_BASE}/convidados/buscar?q=${encodeURIComponent(termo)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || "Erro ao buscar convidados.");
    }
    return res.json();
  }

  /**
   * Confirma presença de um convidado.
   * @param {string} nome
   * @param {number} acompanhantes
   * @returns {Promise<Object>}
   */
  async confirmarPresenca(nome, acompanhantes) {
    const res = await fetch(`${API_BASE}/convidados/confirmar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, acompanhantes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || "Erro ao confirmar presença.");
    }
    return res.json();
  }

  /**
   * Cancela presença de um convidado.
   * @param {string} nome
   * @returns {Promise<Object>}
   */
  async cancelarPresenca(nome) {
    const res = await fetch(`${API_BASE}/convidados/cancelar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || "Erro ao cancelar presença.");
    }
    return res.json();
  }

  /**
   * Obtém estatísticas gerais do evento.
   * @returns {Promise<Object>}
   */
  async obterEstatisticas() {
    const res = await fetch(`${API_BASE}/estatisticas`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || "Erro ao obter estatísticas.");
    }
    return res.json();
  }
}

// ──────────────────────────────────────────────
// 2. UIManager — manipulação do DOM e feedback
// ──────────────────────────────────────────────
class UIManager {
  constructor() {
    this.toast = document.getElementById("toast");
    this._toastTimer = null;
  }

  /**
   * Exibe uma notificação temporária.
   * @param {string} mensagem
   * @param {"success"|"error"|""} tipo
   */
  mostrarToast(mensagem, tipo = "") {
    clearTimeout(this._toastTimer);
    this.toast.textContent = mensagem;
    this.toast.className = `show ${tipo}`;
    this._toastTimer = setTimeout(() => {
      this.toast.className = "";
    }, 3000);
  }

  /**
   * Atualiza o painel de estatísticas com animação.
   * @param {Object} stats
   */
  atualizarEstatisticas(stats) {
    const campos = {
      "stat-total":       stats.totalConvidados,
      "stat-confirmados": stats.totalConfirmados,
      "stat-ausentes":    stats.totalAusentes,
      "stat-acomp":       stats.totalAcompanhantes,
    };

    for (const [id, valor] of Object.entries(campos)) {
      const el = document.getElementById(id);
      if (el && el.textContent !== String(valor)) {
        el.textContent = valor;
        el.classList.remove("updated");
        // Força reflow para reiniciar animação
        void el.offsetWidth;
        el.classList.add("updated");
      }
    }
  }

  /**
   * Renderiza a lista de resultados de busca.
   * @param {Array} convidados
   * @param {Function} onSelect
   */
  renderizarResultados(convidados, onSelect) {
    const lista = document.getElementById("results-list");
    lista.innerHTML = "";

    if (convidados.length === 0) {
      lista.innerHTML = `<li class="no-results">Nenhum convidado encontrado.</li>`;
      lista.classList.add("visible");
      return;
    }

    convidados.forEach((c) => {
      const li = document.createElement("li");
      const badge = c.confirmado
        ? `<span class="badge confirmed">Confirmado</span>`
        : `<span class="badge pending">Pendente</span>`;
      li.innerHTML = `<span>${this._escapar(c.nome)}</span>${badge}`;
      li.addEventListener("click", () => onSelect(c));
      lista.appendChild(li);
    });

    lista.classList.add("visible");
  }

  ocultarResultados() {
    const lista = document.getElementById("results-list");
    lista.classList.remove("visible");
    lista.innerHTML = "";
  }

  /** Exibe o card de confirmação com os dados do convidado. */
  exibirCard(convidado) {
    const card = document.getElementById("confirm-card");
    document.getElementById("selected-name-display").textContent = convidado.nome;
    card.classList.add("visible");
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  ocultarCard() {
    document.getElementById("confirm-card").classList.remove("visible");
  }

  _escapar(texto) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
  }
}

// ──────────────────────────────────────────────
// 3. SearchController — controla a busca
// ──────────────────────────────────────────────
class SearchController {
  /**
   * @param {ApiService} api
   * @param {UIManager} ui
   * @param {Function} onSelect
   */
  constructor(api, ui, onSelect) {
    this.api = api;
    this.ui = ui;
    this.onSelect = onSelect;
    this._debounceTimer = null;

    this._input = document.getElementById("search-input");
    this._input.addEventListener("input", () => this._onInput());

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#results-list") && e.target !== this._input) {
        this.ui.ocultarResultados();
      }
    });
  }

  _onInput() {
    clearTimeout(this._debounceTimer);
    const termo = this._input.value.trim();

    if (termo.length < 1) {
      this.ui.ocultarResultados();
      return;
    }

    this._debounceTimer = setTimeout(() => this._executarBusca(termo), 280);
  }

  async _executarBusca(termo) {
    try {
      const resultados = await this.api.buscarConvidados(termo);
      this.ui.renderizarResultados(resultados, (c) => {
        this._input.value = "";
        this.ui.ocultarResultados();
        this.onSelect(c);
      });
    } catch (err) {
      this.ui.mostrarToast(err.message, "error");
    }
  }
}

// ──────────────────────────────────────────────
// 4. ConfirmController — controla o card de confirmação
// ──────────────────────────────────────────────
class ConfirmController {
  /**
   * @param {ApiService} api
   * @param {UIManager} ui
   * @param {Function} onSaved
   */
  constructor(api, ui, onSaved) {
    this.api = api;
    this.ui = ui;
    this.onSaved = onSaved;

    this._convidadoAtual = null;
    this._escolha = null;   // "yes" | "no" | null
    this._acomp = 0;

    this._btnYes   = document.getElementById("btn-yes");
    this._btnNo    = document.getElementById("btn-no");
    this._btnDec   = document.getElementById("btn-dec");
    this._btnInc   = document.getElementById("btn-inc");
    this._acompVal = document.getElementById("acomp-value");
    this._acompSec = document.getElementById("acomp-section");
    this._btnSave  = document.getElementById("btn-save");
    this._btnClose = document.getElementById("btn-close");

    this._btnYes.addEventListener("click", () => this._setEscolha("yes"));
    this._btnNo.addEventListener("click",  () => this._setEscolha("no"));
    this._btnDec.addEventListener("click", () => this._ajustarAcomp(-1));
    this._btnInc.addEventListener("click", () => this._ajustarAcomp(+1));
    this._btnSave.addEventListener("click", () => this._salvar());
    this._btnClose.addEventListener("click", () => this._fechar());
  }

  /** Abre o card para um convidado. */
  abrir(convidado) {
    this._convidadoAtual = convidado;
    this._escolha = null;
    this._acomp = 0;

    // Pré-seleciona estado atual
    if (convidado.confirmado) {
      this._setEscolha("yes");
      this._acomp = convidado.acompanhantes;
      this._acompVal.textContent = this._acomp;
    } else {
      this._btnYes.className = "toggle-btn";
      this._btnNo.className  = "toggle-btn";
      this._acompSec.classList.remove("visible");
    }

    this._atualizarBotaoSalvar();
    this.ui.exibirCard(convidado);
  }

  _setEscolha(escolha) {
    this._escolha = escolha;
    this._acomp = 0;
    this._acompVal.textContent = 0;

    if (escolha === "yes") {
      this._btnYes.className = "toggle-btn active-yes";
      this._btnNo.className  = "toggle-btn";
      this._acompSec.classList.add("visible");
    } else {
      this._btnNo.className  = "toggle-btn active-no";
      this._btnYes.className = "toggle-btn";
      this._acompSec.classList.remove("visible");
    }

    this._atualizarBotaoSalvar();
  }

  _ajustarAcomp(delta) {
    const novo = this._acomp + delta;
    if (novo < 0) return;
    this._acomp = novo;
    this._acompVal.textContent = this._acomp;
  }

  _atualizarBotaoSalvar() {
    this._btnSave.disabled = this._escolha === null;
  }

  async _salvar() {
    if (!this._convidadoAtual || this._escolha === null) {
      this.ui.mostrarToast("Selecione uma opção antes de salvar.", "error");
      return;
    }

    this._btnSave.disabled = true;
    this._btnSave.textContent = "Salvando…";

    try {
      if (this._escolha === "yes") {
        await this.api.confirmarPresenca(this._convidadoAtual.nome, this._acomp);
        this.ui.mostrarToast("Presença confirmada com sucesso!", "success");
      } else {
        await this.api.cancelarPresenca(this._convidadoAtual.nome);
        this.ui.mostrarToast("Você foi marcado como ausente.", "");
      }

      await this.onSaved();
      this._fechar();
    } catch (err) {
      this.ui.mostrarToast(err.message, "error");
    } finally {
      this._btnSave.disabled = false;
      this._btnSave.textContent = "Salvar confirmação";
    }
  }

  _fechar() {
    this._convidadoAtual = null;
    this._escolha = null;
    this.ui.ocultarCard();
  }
}

// ──────────────────────────────────────────────
// 5. App — ponto de entrada, orquestra os controllers
// ──────────────────────────────────────────────
class App {
  constructor() {
    this.api    = new ApiService();
    this.ui     = new UIManager();
    this.confirmCtrl = new ConfirmController(
      this.api,
      this.ui,
      () => this._carregarEstatisticas()
    );
    this.searchCtrl = new SearchController(
      this.api,
      this.ui,
      (c) => this.confirmCtrl.abrir(c)
    );
  }

  async iniciar() {
    await this._carregarEstatisticas();
  }

  async _carregarEstatisticas() {
    try {
      const stats = await this.api.obterEstatisticas();
      this.ui.atualizarEstatisticas(stats);
    } catch (err) {
      this.ui.mostrarToast("Não foi possível carregar as estatísticas.", "error");
    }
  }
}

// ── Bootstrap
const app = new App();
app.iniciar();
