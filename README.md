# Unsolved — Sistema de Gerenciamento de Cold Cases

O **Unsolved** é um projeto acadêmico de gerenciamento de crimes não resolvidos.
O repositório combina um site/protótipo em **ASP.NET Core MVC (.NET 10)** com uma
entrega relacional completa em **MySQL 8**, incluindo schema, dados fictícios,
consultas, documentação e apresentação.

> Status: **protótipo acadêmico**. A interface ainda usa dados em memória; o
> banco MySQL entregue neste repositório ainda não está ligado ao painel.

## Objetivo

Centralizar casos, vítimas, suspeitos, testemunhas, investigadores, evidências e
análises periciais, permitindo cruzar vínculos que normalmente ficam dispersos
em documentos e sistemas diferentes.

**Slogan:** pistas conectadas, respostas possíveis.

## Entregáveis

- Site institucional responsivo e painel administrativo demonstrativo.
- Modelo relacional normalizado para MySQL 8.
- Carga de dados 100% fictícia com 12 casos e relações suficientes para testes.
- Dez consultas pedidas no exercício e relatório extra de testemunhas
  recorrentes.
- Diagrama entidade-relacionamento e decisões de modelagem.
- Análise de aderência aos dois anexos e próximos passos.
- Apresentação de 5–7 minutos com notas do apresentador.

Apresentação final: [`docs/presentation/Unsolved_Pitch_MySQL.pptx`](docs/presentation/Unsolved_Pitch_MySQL.pptx)  
Roteiro: [`docs/presentation/ROTEIRO.md`](docs/presentation/ROTEIRO.md)

## Tecnologias

| Camada | Tecnologia | Situação |
|---|---|---|
| Interface | Razor Views, HTML5, CSS3 e JavaScript | Implementada como demo |
| Aplicação | ASP.NET Core MVC, .NET 10 | Implementada |
| Dados da demo | Serviços em memória | Implementados |
| Banco acadêmico | MySQL 8.0+ / InnoDB | Implementado em scripts |
| Banco local opcional | Docker Compose + MySQL 8.4 | Configurado |
| Persistência do site | EF Core + provedor MySQL | Próxima etapa |

## Execução do site

Pré-requisito: [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0).

```bash
dotnet restore Unsolved.slnx
dotnet run --project src/Unsolved.Web/Unsolved.csproj
```

Abra a URL exibida pelo terminal. Para recarregamento automático:

```bash
dotnet watch run --project src/Unsolved.Web/Unsolved.csproj
```

### Rotas principais

| Página | Rota |
|---|---|
| Início | `/` |
| Sobre | `/sobre` |
| Recursos | `/recursos` |
| Segurança | `/seguranca` |
| Contato | `/contato` |
| Solicitar demonstração | `/solicitar-demonstracao` |
| Login demonstrativo | `/account/login` |
| Painel da demo | `/sistema/painel` |

Na tela de login, qualquer e-mail e senha válidos **apenas no formato** abrem a
demonstração. Não existe autenticação real nesta versão.

## Execução do MySQL

### Opção A — Docker Compose

Pré-requisitos: Docker Desktop com o mecanismo Linux iniciado.

No PowerShell:

```powershell
Copy-Item .env.example .env
# Edite .env e troque as três credenciais antes de continuar.
docker compose up -d
docker compose ps
```

Na primeira inicialização do volume, o container aplica automaticamente
`database/01_schema.sql` e `database/02_seed.sql`.

Para executar as consultas:

```powershell
docker compose exec mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

Para rodar `03_queries.sql` diretamente a partir do host:

```powershell
Get-Content database/03_queries.sql -Raw |
  docker compose exec -T mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

As credenciais são lidas das variáveis internas do container. O arquivo `.env`
está no `.gitignore` e não deve ser enviado ao GitHub.

### Opção B — MySQL instalado localmente

```bash
mysql -u root -p < database/01_schema.sql
mysql -u root -p < database/02_seed.sql
mysql -u root -p < database/03_queries.sql
```

O script [`00_reset.sql`](database/00_reset.sql) apaga o banco acadêmico e só
deve ser usado para reiniciar a demonstração.

## Modelo de dados

Entidades centrais:

- `cities` e `cases` — local, descrição, datas, prioridade e status.
- `people` — identidade reutilizada nos diferentes papéis.
- `case_victims` — idade na ocorrência, ocupação, relação e perfil.
- `suspect_profiles` e `case_suspects` — histórico criminal, apelido e vínculo.
- `case_witnesses` — contato, depoimento e confiabilidade.
- `investigators` e `case_investigators` — especialidade e atribuições.
- `evidence` e `forensic_analyses` — vestígio, descoberta, custódia e perícias.
- `case_status_history` — trajetória de arquivamento, reabertura e resolução.

Consulte o [diagrama ER](docs/architecture/ERD.md), a
[análise completa](docs/analysis/ANALISE_E_REQUISITOS.md) e o
[índice da documentação](docs/README.md).

## Consultas entregues

O arquivo [`database/03_queries.sql`](database/03_queries.sql) contém:

1. Casos não resolvidos com mais de 20 anos, mais a variante dos últimos 20.
2. Casos por quantidade de evidências.
3. Suspeitos presentes em mais de um caso arquivado.
4. Testemunhas de alta confiabilidade e seus depoimentos.
5. Cidades por quantidade de casos arquivados.
6. Evidências descobertas nos últimos seis meses.
7. Evidências com análise de DNA.
8. Investigadores por quantidade de casos resolvidos.
9. Casos não resolvidos de um suspeito informado.
10. Média de idade e perfil ocupacional das vítimas.

Também há um relatório adicional de testemunhas recorrentes.

## Estrutura relevante

```text
Unsolved/
├── src/
│   └── Unsolved.Web/         # Aplicação ASP.NET Core MVC
│       ├── Controllers/      # Rotas e ações MVC
│       ├── Models/           # Modelos atuais da demonstração
│       ├── Services/         # Dados em memória e contato
│       ├── ViewModels/       # Modelos de formulário
│       ├── Views/            # Páginas Razor públicas e administrativas
│       └── wwwroot/          # CSS, JavaScript, fontes e imagens
├── database/
│   ├── 00_reset.sql          # Reset opcional e destrutivo
│   ├── 01_schema.sql         # Tabelas, FKs, índices, checks e views
│   ├── 02_seed.sql           # Massa fictícia
│   └── 03_queries.sql        # Consultas do exercício
├── docs/
│   ├── analysis/             # Requisitos, aderência e pendências
│   ├── architecture/         # ERD e decisões de modelagem
│   └── presentation/         # Pitch, roteiro e materiais visuais
├── compose.yaml              # MySQL 8.4 local
├── Unsolved.slnx             # Solução .NET
└── .env.example              # Variáveis sem credenciais reais
```

## Identidade visual

- Marrom investigativo: `#8B6220`
- Amarelo dourado: `#F0D86D`
- Azul acinzentado: `#B5CDDA`
- Preto amarronzado: `#201D12`

A interface usa referências a murais de evidências, carimbos, lupa, impressões
digitais e linhas que conectam pistas. Os easter eggs servem apenas à narrativa
da demo e não são recomendados para uma ferramenta operacional.

## Limitações conhecidas

- O painel não lê nem grava no MySQL.
- O login não autentica usuários e não possui autorização por perfil.
- Mensagens de contato e dados da demo ficam apenas em memória.
- Não há trilha de auditoria da aplicação, upload real ou cadeia de custódia.
- Não devem ser usados dados reais ou sensíveis neste repositório público.

## Roadmap recomendado

1. Adicionar Entity Framework Core e um provedor MySQL compatível com .NET 10.
2. Mapear o schema em entidades e criar `UnsolvedDbContext`.
3. Guardar a conexão em User Secrets ou variáveis de ambiente.
4. Substituir `DemoDataService` por consultas assíncronas e paginadas.
5. Implementar ASP.NET Core Identity, perfis e autorização.
6. Criar migrations, testes unitários e testes de integração com MySQL.
7. Adicionar auditoria, retenção, backup e tratamento de dados sensíveis.


## Uso responsável

Todos os casos, nomes, depoimentos e evidências da carga são fictícios. O
Unsolved é uma proposta educacional de apoio à organização investigativa e não
substitui investigação humana, perícia oficial ou decisão judicial.
