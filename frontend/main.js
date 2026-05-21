// Estado da aplicação
    let convidadoSelecionado = null;
    let presenca = null;
    let acompanhantes = 0;
    let timerBusca = null;

    // Carrega estatísticas ao iniciar
    carregarEstatisticas();

    // Evento de busca com debounce
    document.getElementById("campo-busca").addEventListener("input", function () {
      clearTimeout(timerBusca);
      const termo = this.value.trim();
      if (termo.length === 0) {
        document.getElementById("lista-resultados").innerHTML = "";
        return;
      }
      timerBusca = setTimeout(() => buscar(termo), 300);
    });

    // Busca convidados na API
    async function buscar(termo) {
      const resposta = await fetch("/api/buscar?q=" + encodeURIComponent(termo));
      const convidados = await resposta.json();
      renderizarResultados(convidados);
    }

    // Exibe os resultados na tela
    function renderizarResultados(convidados) {
      const lista = document.getElementById("lista-resultados");

      if (convidados.length === 0) {
        lista.innerHTML = "<p style='color:#888;margin-top:8px'>Nenhum convidado encontrado.</p>";
        return;
      }

      lista.innerHTML = convidados.map(c => `
        <div
          class="item-convidado ${convidadoSelecionado?.nome === c.nome ? 'selecionado' : ''}"
          onclick='selecionarConvidado(${JSON.stringify(c)})'
        >
          <span>${c.nome}</span>
          <span class="badge ${c.confirmado ? 'confirmado' : 'pendente'}">
            ${c.confirmado ? "Confirmado" : "Pendente"}
          </span>
        </div>
      `).join("");
    }

    // Seleciona um convidado e abre o formulário
    function selecionarConvidado(convidado) {
      convidadoSelecionado = convidado;
      presenca = convidado.confirmado;
      acompanhantes = convidado.acompanhantes;

      document.getElementById("nome-selecionado").textContent = convidado.nome;
      document.getElementById("qtd-acompanhantes").textContent = acompanhantes;
      document.getElementById("secao-confirmacao").style.display = "block";
      document.getElementById("mensagem").style.display = "none";

      atualizarBotoesPresenca();
      atualizarBotaoMenos();

      // Atualiza highlight na lista
      document.querySelectorAll(".item-convidado").forEach(el => {
        el.classList.toggle("selecionado", el.querySelector("span").textContent === convidado.nome);
      });
    }

    // Define se vai ou não participar
    function definirPresenca(valor) {
      presenca = valor;
      atualizarBotoesPresenca();
    }

    function atualizarBotoesPresenca() {
      document.getElementById("btn-sim").className = presenca === true  ? "ativo-sim" : "";
      document.getElementById("btn-nao").className = presenca === false ? "ativo-nao" : "";
    }

    // Altera quantidade de acompanhantes
    function alterarAcompanhantes(delta) {
      acompanhantes += delta;
      if (acompanhantes < 0) acompanhantes = 0;
      document.getElementById("qtd-acompanhantes").textContent = acompanhantes;
      atualizarBotaoMenos();
    }

    function atualizarBotaoMenos() {
      document.getElementById("btn-menos").disabled = acompanhantes <= 0;
    }

    // Salva a confirmação
    async function salvar() {
      if (!convidadoSelecionado) {
        exibirMensagem("Selecione um convidado primeiro.", "erro");
        return;
      }
      if (presenca === null) {
        exibirMensagem("Informe se vai participar.", "erro");
        return;
      }

      const btnSalvar = document.querySelector(".btn-salvar");
      btnSalvar.disabled = true;
      btnSalvar.textContent = "Salvando...";

      try {
        const resposta = await fetch("/api/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: convidadoSelecionado.nome,
            confirmado: presenca,
            acompanhantes: acompanhantes
          })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          exibirMensagem(dados.erro || "Erro ao salvar.", "erro");
          return;
        }

        exibirMensagem("Confirmação salva com sucesso!", "sucesso");
        convidadoSelecionado = dados;
        await carregarEstatisticas();

        // Atualiza badge na lista
        const termo = document.getElementById("campo-busca").value.trim();
        if (termo) buscar(termo);

      } catch (e) {
        exibirMensagem("Erro de conexão.", "erro");
      } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Confirmação";
      }
    }

    // Carrega e exibe as estatísticas
    async function carregarEstatisticas() {
      const resposta = await fetch("/api/estatisticas");
      const stats = await resposta.json();
      document.getElementById("stat-total").textContent          = stats.total;
      document.getElementById("stat-confirmados").textContent    = stats.confirmados;
      document.getElementById("stat-ausentes").textContent       = stats.ausentes;
      document.getElementById("stat-acompanhantes").textContent  = stats.acompanhantes;
    }

    // Exibe mensagem de feedback
    function exibirMensagem(texto, tipo) {
      const el = document.getElementById("mensagem");
      el.textContent = texto;
      el.className = tipo;
      el.style.display = "block";
    }