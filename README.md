# Unsolved — Sistema de Gerenciamento de Cold Cases

O **Unsolved** é um protótipo acadêmico para organizar investigações de crimes
não resolvidos. O repositório reúne um site institucional, uma central
investigativa demonstrativa em **ASP.NET Core MVC (.NET 10)** e uma entrega
relacional completa em **MySQL 8**.

> **Base de teste:** todos os nomes, casos, pessoas, imagens e evidências são
> fictícios. As alterações da central são armazenadas somente no navegador e
> não devem receber dados reais ou sensíveis.

## Estado atual

- Site institucional responsivo com uma prévia editável da central.
- Login demonstrativo obrigatório antes de acessar `/sistema`.
- Três perfis com experiências e permissões diferentes.
- SPA investigativa com dados persistidos em IndexedDB.
- 12 casos fictícios, 24 pessoas e evidências relacionadas.
- Dossiês, mural de vínculos, Kanban, linha do tempo e gestão de equipe.
- Upload local de múltiplas fotos para pessoas e evidências.
- Modelo relacional MySQL documentado, ainda separado da aplicação web.

## Funcionalidades da demonstração

### Site institucional

- Apresentação da proposta, recursos, segurança e público-alvo.
- Painel de exemplo editável na seção de solução.
- Alteração simulada de estágio e progresso de um caso.
- Chamada direta para a escolha do perfil de acesso.

### Central investigativa

- Dashboard operacional com indicadores e atividade recente.
- Cadastro, consulta, edição e movimentação de casos.
- Kanban com movimentação entre estágios.
- Cadastro reutilizável de vítimas, suspeitos e testemunhas.
- Registro de evidências e cadeia de custódia demonstrativa.
- Upload de múltiplas imagens, seleção da foto principal e galeria.
- Dossiê detalhado com pessoas, evidências, histórico e anotações.
- Mural investigativo com conexões automáticas entre os registros.
- Gerenciador de vínculos para adicionar, editar ou retirar itens do mural.
- Linha do tempo consolidada por caso.
- Gestão de usuários disponível para o administrador.
- Tema claro/escuro, preferências e backup local da demo.

## Login demonstrativo

A rota `/sistema` é protegida por uma sessão em cookie. Quando não existe uma
sessão válida, a aplicação redireciona para `/account/login`.

As credenciais são públicas de propósito, pois pertencem exclusivamente à base
demonstrativa:

| Perfil | E-mail | Senha | Escopo |
|---|---|---|---|
| Administrador geral | `admin@unsolved.demo` | `admin123` | Acesso completo |
| Detetive responsável | `detetive@unsolved.demo` | `detetive123` | Apenas o caso atribuído |
| Usuário de consulta | `consulta@unsolved.demo` | `consulta123` | Somente leitura |

### Matriz de permissões

| Ação | Administrador | Detetive | Consulta |
|---|:---:|:---:|:---:|
| Visualizar todos os casos | Sim | Não | Sim |
| Visualizar o caso atribuído | Sim | Sim | Sim |
| Criar casos | Sim | Não | Não |
| Editar casos | Todos | Somente o atribuído | Não |
| Movimentar o Kanban | Todos | Somente o atribuído | Não |
| Editar pessoas e evidências | Sim | Somente as ligadas ao caso | Não |
| Alterar vínculos do mural | Sim | Somente no caso atribuído | Não |
| Excluir registros | Sim | Não | Não |
| Gerenciar usuários e backups | Sim | Não | Não |

O perfil de detetive usa o caso:

- `UNS-2009-008 — Sinal Interrompido`
- identificador interno `c5`
- responsável demonstrativo: Rafael Nunes

Além de ocultar ações indisponíveis, a camada de persistência local bloqueia
gravações incompatíveis com o perfil conectado.

## Persistência da demo

A central em `wwwroot/app` é uma SPA em JavaScript sem framework. Os dados são
gravados em **IndexedDB**, enquanto tema, filtros, favoritos e preferências usam
`localStorage`.

Consequências importantes:

- Os dados sobrevivem ao recarregamento da página.
- Cada navegador e origem/porta possui sua própria base.
- Trocar de porta pode apresentar uma base inicial diferente.
- Fotos são redimensionadas e comprimidas antes de serem armazenadas.
- O administrador pode exportar, importar ou restaurar a massa fictícia.
- Nada é enviado para o MySQL ou para um serviço externo nesta versão.

## Tecnologias

| Camada | Tecnologia | Situação |
|---|---|---|
| Site institucional | Razor Views, HTML5, CSS3 e JavaScript | Implementado |
| Central investigativa | SPA JavaScript modular + IndexedDB | Implementada como demo |
| Aplicação | ASP.NET Core MVC, .NET 10 | Implementada |
| Sessão da demo | Cookie Authentication do ASP.NET Core | Implementada |
| Perfis da demo | Catálogo estático de três usuários | Implementado |
| Banco acadêmico | MySQL 8.0+ / InnoDB | Implementado em scripts |
| Banco local opcional | Docker Compose + MySQL 8.4 | Configurado |
| Contêiner do site | Dockerfile multiestágio (.NET 10) | Configurado |
| Integração da aplicação com MySQL | EF Core + provedor MySQL | Próxima etapa |

## Executando o site

Pré-requisito: [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0).

```bash
dotnet restore Unsolved.slnx
dotnet run --project src/Unsolved.Web/Unsolved.csproj
```

Abra a URL exibida pelo terminal. Para recarregamento automático:

```bash
dotnet watch run --project src/Unsolved.Web/Unsolved.csproj
```

Se já existir uma execução aberta, reinicie o processo após alterações em
controllers, autenticação ou configuração do ASP.NET Core. Mudanças apenas em
CSS e JavaScript são servidas sem cache preso dentro de `/app`.

### Rotas públicas

| Página | Rota |
|---|---|
| Início | `/` |
| Sobre | `/sobre` |
| Recursos | `/recursos` |
| Segurança | `/seguranca` |
| Contato | `/contato` |
| Solicitar demonstração | `/solicitar-demonstracao` |
| Login demonstrativo | `/account/login` |
| Encerrar sessão | `/account/logout` |

### Rotas da central

A central utiliza roteamento por hash:

| Tela | Rota |
|---|---|
| Painel | `/sistema#/painel` |
| Casos | `/sistema#/casos` |
| Detalhe de caso | `/sistema#/casos/{id}` |
| Evidências | `/sistema#/evidencias` |
| Pessoas | `/sistema#/pessoas` |
| Detalhe de pessoa | `/sistema#/pessoas/{id}` |
| Linha do tempo | `/sistema#/timeline` |
| Kanban | `/sistema#/kanban` |
| Mural | `/sistema#/mural` |
| Mural de um caso | `/sistema#/mural?case={id}` |
| Usuários | `/sistema#/usuarios` |
| Configurações | `/sistema#/config` |

## Validação do projeto

Compilação:

```bash
dotnet build src/Unsolved.Web/Unsolved.csproj -c Release --nologo
```

Verificação de sintaxe dos módulos JavaScript no PowerShell:

```powershell
$files = Get-ChildItem src/Unsolved.Web/wwwroot -Recurse -Filter *.js
foreach ($file in $files) { node --check $file.FullName }
```

Os fluxos de administrador, detetive e consulta foram testados no navegador,
incluindo redirecionamento para login, restrição do caso atribuído, bloqueio de
edição e logout.

## Deploy com Docker

O [`Dockerfile`](Dockerfile) empacota o site em uma imagem .NET 10. A aplicação
escuta em `0.0.0.0:8080` e respeita a variável de ambiente `PORT` quando ela é
fornecida pela plataforma de hospedagem.

```bash
docker build -t unsolved-web .
docker run -p 8080:8080 unsolved-web
```

Acesse `http://localhost:8080`.

## Executando o MySQL

O banco acadêmico ainda não está conectado à central demonstrativa.

### Docker Compose

```powershell
Copy-Item .env.example .env
# Edite .env e substitua as credenciais antes de continuar.
docker compose up -d
docker compose ps
```

Na primeira inicialização do volume, o container aplica automaticamente
`database/01_schema.sql` e `database/02_seed.sql`.

Para abrir o cliente MySQL:

```powershell
docker compose exec mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

Para executar as consultas do exercício:

```powershell
Get-Content database/03_queries.sql -Raw |
  docker compose exec -T mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

### MySQL instalado localmente

```bash
mysql -u root -p < database/01_schema.sql
mysql -u root -p < database/02_seed.sql
mysql -u root -p < database/03_queries.sql
```

O script [`database/00_reset.sql`](database/00_reset.sql) apaga o banco
acadêmico e deve ser utilizado somente quando for necessário reiniciar a carga.

## Modelo de dados MySQL

Entidades centrais:

- `cities` e `cases`: local, descrição, datas, prioridade e status.
- `people`: identidade reutilizada em diferentes papéis.
- `case_victims`: idade na ocorrência, ocupação, relação e perfil.
- `suspect_profiles` e `case_suspects`: histórico criminal e vínculo.
- `case_witnesses`: contato, depoimento e confiabilidade.
- `investigators` e `case_investigators`: especialidade e atribuições.
- `evidence` e `forensic_analyses`: vestígio, custódia e perícias.
- `case_status_history`: trajetória de arquivamento e resolução.

Consulte o [diagrama ER](docs/architecture/ERD.md), a
[análise de requisitos](docs/analysis/ANALISE_E_REQUISITOS.md) e o
[índice da documentação](docs/README.md).

## Estrutura relevante

```text
Unsolved/
├── src/Unsolved.Web/
│   ├── Controllers/             # Site, login, sessão e rota protegida
│   ├── Models/Demo/             # Perfis e modelos demonstrativos
│   ├── Services/                # Dados do site institucional e contato
│   ├── ViewModels/              # Modelos dos formulários Razor
│   ├── Views/                   # Páginas institucionais e login
│   └── wwwroot/
│       ├── app/                 # SPA da central investigativa
│       │   ├── assets/          # Atlas de retratos e evidências
│       │   ├── css/             # Tokens e componentes da central
│       │   └── js/              # Banco local, autenticação e views
│       ├── css/                 # Estilos do site institucional
│       ├── images/              # Marca e evidências ilustradas
│       └── js/                  # Interações da landing e do login
├── database/                    # Schema, seed, consultas e reset MySQL
├── docs/                        # Análise, arquitetura e apresentação
├── Dockerfile
├── compose.yaml
└── Unsolved.slnx
```

## Identidade visual

- Marrom investigativo: `#8B6220`
- Amarelo dourado: `#F0D86D`
- Azul acinzentado: `#B5CDDA`
- Preto amarronzado: `#201D12`

A interface combina tipografia editorial, superfícies de dossiê, carimbos,
impressões digitais, fotografias ilustradas e linhas de conexão. O redesign do
login, da landing e da central mantém a mesma linguagem visual.

## Apresentação e documentação

- [`docs/presentation/Unsolved_Pitch_MySQL.pptx`](docs/presentation/Unsolved_Pitch_MySQL.pptx)
- [`docs/presentation/Unsolved_Pitch_Aprimorado.pptx`](docs/presentation/Unsolved_Pitch_Aprimorado.pptx)
- [`docs/presentation/ROTEIRO.md`](docs/presentation/ROTEIRO.md)
- [`docs/EXPLICACAO_TECNICA.md`](docs/EXPLICACAO_TECNICA.md)

## Limitações conhecidas

- A autenticação é demonstrativa e utiliza três contas estáticas.
- As credenciais da demo não devem ser reutilizadas em produção.
- A autorização por registro no SPA é uma simulação no cliente; uma aplicação
  real deve repetir todas as regras no servidor e no banco de dados.
- O painel ainda não lê nem grava no MySQL.
- As fotos permanecem no IndexedDB e não são enviadas a um armazenamento
  seguro de objetos.
- A cadeia de custódia, auditoria e os hashes exibidos são demonstrativos.
- Mensagens de contato permanecem em memória.

## Próximos passos recomendados

1. Adicionar Entity Framework Core e um provedor MySQL compatível com .NET 10.
2. Mapear o schema em entidades e criar `UnsolvedDbContext`.
3. Implementar ASP.NET Core Identity com usuários armazenados no banco.
4. Aplicar autorização por política e por caso também no servidor.
5. Migrar fotos para armazenamento seguro com controle de acesso.
6. Criar trilha de auditoria imutável e cadeia de custódia verificável.
7. Adicionar testes unitários, integração e testes automatizados de interface.
8. Definir retenção, backup, criptografia e tratamento de dados sensíveis.

## Uso responsável

O Unsolved é uma proposta educacional de apoio à organização investigativa. O
sistema não substitui investigação humana, perícia oficial ou decisão judicial.
