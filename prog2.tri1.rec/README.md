# prog2.tri1.rec

Sistema Web de Confirmação de Participação em Evento — Atividade de Recuperação Trimestre 1 — Programação II.

---

## Descrição

Aplicação de página única (SPA) para gerenciamento de RSVP de um evento. Os convidados pesquisam seus nomes, confirmam ou cancelam presença e informam o número de acompanhantes. Todas as informações são persistidas em um arquivo `dados.json`.

---

## Tecnologias Utilizadas

| Camada    | Tecnologia                        |
|-----------|-----------------------------------|
| Back-end  | [Bun](https://bun.sh) + TypeScript |
| Front-end | HTML5, CSS3, JavaScript (ES2022)  |
| Dados     | Arquivo JSON (`dados.json`)       |

---

## Estrutura do Projeto

```
prog2.tri1.rec/
│
├── frontend/
│   ├── index.html        # Página única da aplicação
│   └── app.js            # Lógica do front-end (OOP: 4 classes)
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts                          # Entrada do servidor Bun
│       ├── models/
│       │   ├── Convidado.ts                   # Entidade Convidado
│       │   └── Estatisticas.ts                # Entidade Estatísticas
│       ├── services/
│       │   ├── JsonRepository.ts              # Leitura/escrita do JSON
│       │   └── ConvidadoService.ts            # Regras de negócio
│       ├── controllers/
│       │   └── ConvidadoController.ts         # Tratamento das requisições HTTP
│       └── routes/
│           └── Router.ts                      # Registro e despacho de rotas
│
├── dados.json            # Persistência de dados
├── .gitignore
└── README.md
```

---

## Instruções de Execução

### Pré-requisitos

- [Bun](https://bun.sh) instalado (`curl -fsSL https://bun.sh/install | bash`)

### Passos

**1. Instalar dependências do back-end:**

```bash
cd backend
bun install
```

**2. Iniciar o servidor:**

```bash
bun run start
# ou, com hot-reload:
bun run dev
```

O servidor estará disponível em: `http://localhost:3000`

**3. Abrir o front-end:**

Abra o arquivo `frontend/index.html` diretamente no navegador, ou sirva com qualquer servidor estático:

```bash
# Exemplo usando Bun como servidor de arquivos estáticos (na pasta frontend):
cd ../frontend
bunx serve .
```

---

## Rotas da API

| Método | Rota                          | Descrição                              |
|--------|-------------------------------|----------------------------------------|
| GET    | `/api/convidados/buscar?q=`   | Busca convidados por nome (parcial)    |
| POST   | `/api/convidados/confirmar`   | Confirma presença + acompanhantes      |
| POST   | `/api/convidados/cancelar`    | Cancela presença do convidado          |
| GET    | `/api/estatisticas`           | Retorna totais do evento               |

### Exemplos de Payload

**Confirmar presença:**
```json
{ "nome": "Ana Silva", "acompanhantes": 2 }
```

**Cancelar presença:**
```json
{ "nome": "Ana Silva" }
```

---

## Explicação da Comunicação Front-end ↔ Back-end

O front-end usa a **Fetch API** (assíncrona) para se comunicar com o back-end:

1. O usuário digita no campo de busca → `SearchController` aguarda 280ms (debounce) e chama `ApiService.buscarConvidados()`.
2. `ApiService` faz `fetch GET /api/convidados/buscar?q=...`.
3. O back-end lê o `dados.json` via `JsonRepository`, filtra os nomes e retorna JSON.
4. O front-end exibe os resultados sem recarregar a página.
5. Ao salvar, `ConfirmController` chama `ApiService.confirmarPresenca()` ou `ApiService.cancelarPresenca()`.
6. O back-end atualiza o `dados.json` e retorna o convidado atualizado.
7. O front-end recarrega as estatísticas dinamicamente.

---

## Classes do Projeto

### Back-end (TypeScript)

| Classe               | Responsabilidade                                 |
|----------------------|--------------------------------------------------|
| `Convidado`          | Modelo de dados; métodos `confirmarPresenca()`, `cancelarPresenca()` |
| `Estatisticas`       | Modelo para os totais do evento                  |
| `JsonRepository`     | Leitura e escrita no `dados.json` via Bun        |
| `ConvidadoService`   | Regras de negócio (busca, confirmação, cálculo de stats) |
| `ConvidadoController`| Trata as requisições HTTP, valida entradas        |
| `Router`             | Registra as rotas e despacha para o controller   |

### Front-end (JavaScript)

| Classe              | Responsabilidade                                  |
|---------------------|---------------------------------------------------|
| `ApiService`        | Toda comunicação com o back-end via `fetch`       |
| `UIManager`         | Manipulação do DOM, toasts, renderização          |
| `SearchController`  | Controla a busca com debounce                     |
| `ConfirmController` | Controla o card de confirmação/cancelamento       |
| `App`               | Orquestra todos os controllers                    |

---

## Critérios Atendidos

- [x] Funcionamento completo do sistema
- [x] Manipulação de JSON (leitura e escrita)
- [x] Orientação a objetos (mín. 4 classes em cada camada)
- [x] Front-end organizado e responsivo
- [x] Separação entre lógica e rotas no back-end
- [x] Tratamento de erros
- [x] Validação de entradas
- [x] Estatísticas em tempo real
- [x] Busca parcial de nomes
- [x] Acompanhantes não negativos
- [x] Sem cadastro manual de convidados pela interface
- [x] Sem banco de dados
- [x] SPA — sem recarregamento de página
