# Unsolved — Explicação técnica do projeto

Documento didático: **como o projeto foi construído**, quais linguagens, qual
arquitetura, os principais métodos/funções e o *porquê* de cada escolha.
Escrito para acompanhar a apresentação acadêmica.

> Resumo em uma frase: um site em **ASP.NET Core MVC (.NET 10)** com uma área
> demonstrativa que espelha um **banco relacional MySQL** de "cold cases"
> (crimes não resolvidos).

---

## 1. Linguagens e onde cada uma atua

| Linguagem | Onde (pasta) | Para quê |
|---|---|---|
| **C#** | `Controllers/`, `Services/`, `Models/`, `ViewModels/`, `Program.cs` | Toda a lógica do servidor (executa no .NET 10) |
| **Razor** (`.cshtml`) | `Views/` | Mistura HTML + C# e gera as páginas **no servidor** |
| **HTML5** | dentro das Views | Estrutura semântica das páginas |
| **CSS3** | `wwwroot/css/` | Visual, responsividade e animações |
| **JavaScript (puro/vanilla)** | `wwwroot/js/` | Interações no navegador, **sem frameworks** |
| **SQL (MySQL 8)** | `database/*.sql` | Criação do banco, dados e consultas |
| **SVG** | `wwwroot/images/evidence/` | Fotos de evidência (imagens vetoriais) |

Por que essa combinação: é o *stack* padrão do ASP.NET Core. C# no servidor,
Razor para gerar HTML, e JS puro só para os detalhes de interface — mantendo o
projeto leve e sem dependências pesadas.

---

## 2. Arquitetura: padrão MVC (Model–View–Controller)

O ASP.NET Core organiza a aplicação em três papéis, **separando as
responsabilidades**:

- **Model** — classes que representam os dados (ex.: `InvestigationCase`,
  `Evidence`, `Person`). São apenas "caixas" de dados.
- **View** — arquivos `.cshtml` que transformam os dados em HTML.
- **Controller** — o "maestro": recebe a URL, busca os dados e escolhe qual
  View devolver.

**Por que usar MVC?** Cada mudança fica isolada: trocar o visual mexe só nas
Views; mudar a lógica, só nos Controllers; mudar a origem dos dados, só nos
Services. Um não quebra o outro.

### Fluxo de uma requisição (exemplo: abrir `/sistema/casos/3`)

```
1. Navegador pede  GET /sistema/casos/3
2. Roteamento      -> DemoController.CaseDetails(3)
3. Controller      -> _data.GetCase(3)              (chama o Service)
4. Service         -> devolve o InvestigationCase (Model) com evidências,
                      pessoas, perícias e histórico
5. Controller      -> return View(caso)             -> CaseDetails.cshtml
6. Razor           -> monta o HTML com os dados
7. Navegador       -> recebe HTML + CSS + JS; admin.js liga o lightbox das fotos
```

---

## 3. As camadas e o "porquê" (a parte mais importante)

### Services + Interfaces + Injeção de Dependência (DI)

É o que deixa o projeto **preparado para ligar no banco real sem reescrita**:

- `IDemoDataService` (**interface**) define *o que* existe
  (`GetCases()`, `GetCase(id)`, `GetAllEvidence()`…).
- `DemoDataService` (**implementação**) define *como* — hoje, dados em memória
  idênticos ao `database/02_seed.sql`.
- Em `Program.cs`:
  `builder.Services.AddSingleton<IDemoDataService, DemoDataService>();`
- O `DemoController` recebe o serviço pelo **construtor** e nunca sabe de onde
  vêm os dados.

**Por quê:** quando o site for ligado ao **MySQL**, basta criar uma nova
implementação (ex.: `DemoDataServiceEfCore`) e trocar **uma linha** no
`Program.cs`. Controllers e Views não mudam nada. Isso se chama
*inversão de dependência* — o código depende da interface, não da implementação.

---

## 4. Estrutura de pastas (o que há em cada uma)

```
src/Unsolved.Web/
├── Program.cs         # Inicialização: registra serviços, rotas e middleware
├── Controllers/       # Recebem as requisições e devolvem Views/JSON
├── Models/            # Classes de dados (domínio da demo)
├── ViewModels/        # Modelos de formulário (com regras de validação)
├── Services/          # Fonte de dados (memória hoje; MySQL depois)
├── Views/             # Páginas Razor (públicas e do sistema)
│   ├── Shared/        # Layouts e partials reutilizados
│   └── Icons.cs       # Helpers de ícones/badges (C# auxiliar das Views)
└── wwwroot/           # Arquivos estáticos: css, js, images, fonts, favicon
database/              # Scripts SQL (schema, seed, consultas)
docs/                  # Documentação, ERD e apresentação
```

---

## 5. Principais métodos e funções

### `Program.cs` (inicialização)
- `AddControllersWithViews()` — habilita o MVC.
- `AddSingleton<IServico, Servico>()` — registra os serviços para a DI.
- `UseStaticFiles()` — serve CSS/JS/imagens de `wwwroot`.
- `MapControllerRoute(...)` — o roteamento padrão `{controller}/{action}/{id?}`.
- `UseStatusCodePagesWithReExecute("/Home/StatusCodeError")` — página **404**
  personalizada.
- `UseHttpsRedirection()` / `UseHsts()` — segurança de transporte.

### Controllers
- **`HomeController`** — páginas públicas (`Index`, `Sobre`, `Recursos`,
  `Seguranca`, `Contato`…) e as páginas de erro (`Error`, `StatusCodeError`).
  Usa `[Route("sobre")]` etc. para **URLs limpas**.
- **`DemoController`** — a área do sistema, com `[Route("sistema")]` e **uma
  action por tela** (`Dashboard`, `Cases`, `CaseDetails`, `Evidence`, `People`,
  `Timeline`, `Board`, `Reports`, `Users`, `Settings`).
- **`ContactController`** — recebe o formulário via **POST/AJAX**, valida no
  servidor (`ModelState`), responde em **JSON** e é protegido com
  `[ValidateAntiForgeryToken]` (defesa contra CSRF).
- **`AccountController`** — login **apenas demonstrativo** (valida o formato e
  encaminha ao painel; não há autenticação real).

### Validação dupla (padrão profissional)
- **Cliente**: `validation.js` dá feedback imediato.
- **Servidor**: *Data Annotations* nos ViewModels (`[Required]`,
  `[EmailAddress]`, `[StringLength]`), verificadas por `ModelState.IsValid`.
- **Por quê:** o cliente melhora a experiência, mas o servidor é quem garante —
  nunca se confia apenas no navegador.

### Helpers das Views (`Views/Icons.cs`)
- `Icons.Svg("folder")` — devolve o SVG de um ícone.
- `DemoUi.StatusClass(status)` / `DemoUi.PriorityClass(prioridade)` — devolvem a
  classe CSS certa para os "badges".
- **Por quê:** evita repetir código nas Views (princípio **DRY**).

---

## 6. JavaScript (cada arquivo com uma função clara)

| Arquivo | Responsabilidade |
|---|---|
| `menu.js` | Menu hambúrguer (mobile) |
| `validation.js` | Validação de formulários (espelha as regras do servidor) |
| `forms.js` | Envio do contato via `fetch` (AJAX), sem recarregar a página |
| `interactions.js` | Animações ao rolar (`IntersectionObserver`), FAQ accordion, modal, voltar-ao-topo, contadores |
| `site.js` | Estado do cabeçalho ao rolar + easter egg da logo |
| `mystery.js` | Caça aos segredos (10 segredos em 3 missões) |
| `demo.js` | Explorador de casos interativo na home |
| `admin.js` | Barra lateral, contadores, filtro de tabela e **lightbox** das fotos |

Tudo respeita `prefers-reduced-motion` (acessibilidade) e não depende de nenhuma
biblioteca externa.

---

## 7. Banco de dados (SQL / MySQL)

- **`01_schema.sql`** — `CREATE TABLE` com:
  - **Chaves estrangeiras (FK)** ligando casos, pessoas, evidências etc.
  - **`ENUM`** para status (`ARQUIVADO`, `EM_REABERTURA`, `EM_ANDAMENTO`,
    `RESOLVIDO`) e prioridade.
  - **`CHECK`** para regras (ex.: um caso `RESOLVIDO` precisa ter data de
    fechamento).
  - **`INDEX`** para acelerar as buscas mais comuns.
  - **`VIEW`s** de relatório (contagem de evidências, casos resolvidos por
    investigador, testemunhas recorrentes).
- **`02_seed.sql`** — os `INSERT` com 12 casos e todas as relações. A demo em
  C# reproduz exatamente esses dados.
- **`03_queries.sql`** — as 10 consultas do exercício (`JOIN`, `GROUP BY`,
  `HAVING`, filtros por data).

**Por que o modelo é normalizado:** a tabela `people` é reutilizada nos papéis
de vítima, suspeito e testemunha (via tabelas de ligação). Isso evita repetir a
mesma pessoa e mantém a **integridade referencial**.

---

## 8. Como a demo se conecta ao banco (hoje e amanhã)

- **Hoje:** `DemoDataService` monta os mesmos dados do seed em memória. A tela
  de **Relatórios** calcula, em C#, as mesmas 10 consultas do `03_queries.sql`.
- **Amanhã (roadmap):** adicionar **Entity Framework Core** + provedor MySQL,
  mapear o schema em um `DbContext` e trocar o serviço em memória por consultas
  reais — sem alterar Controllers nem Views.

---

## 9. Resumo do "porquê" das escolhas

- **MVC** → organização e manutenção.
- **Interfaces + Injeção de Dependência** → trocar memória por MySQL sem
  reescrever a interface.
- **Validação no cliente e no servidor** → boa experiência + segurança.
- **JavaScript puro** → leveza, sem dependências.
- **SVG para as fotos** → imagens nítidas, leves e que funcionam offline.
- **Banco normalizado** → sem redundância e com integridade garantida.

---

*Documento de apoio. Detalhes de execução e do banco estão no
[README](../README.md) e na pasta [docs/](.).*
