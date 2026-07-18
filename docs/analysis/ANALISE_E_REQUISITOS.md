# Análise do projeto e aderência aos anexos

## Resumo executivo

O site atual comunica bem a ideia do **Unsolved** e oferece uma demonstração
visual da área administrativa. Ele ainda não é um sistema operacional: os dados
estão em memória, o login é demonstrativo e não existe persistência ligada à
interface. Para a entrega acadêmica, a prioridade correta é provar a modelagem
relacional e as consultas antes de integrar o MySQL ao ASP.NET Core.

## O que já faz sentido manter

- Identidade visual própria, logo, paleta e linguagem de investigação.
- Páginas públicas de problema, recursos, segurança, contato e demonstração.
- Painel com casos, pessoas, evidências, linha do tempo e relatórios.
- Separação atual em controllers, services, models e views.
- Aviso de que os dados são fictícios e a ferramenta apoia, mas não substitui,
  o trabalho humano.

## O que não deve ser apresentado como pronto

- **Login real:** qualquer credencial apenas valida o formato e abre a demo.
- **Banco integrado ao site:** o painel continua usando `DemoDataService` em
  memória; os scripts MySQL são a camada acadêmica de dados.
- **Segurança operacional:** criptografia, auditoria, perfis de acesso e cadeia
  de custódia completa ainda são requisitos de produção, não funcionalidades
  entregues.
- **Dados reais de investigação:** não devem entrar neste repositório público.
- **Relatórios do painel como prova do SQL:** a prova formal está em
  `database/03_queries.sql`; as telas atuais são uma simulação visual.

## Elementos que podem ser reduzidos numa versão profissional

- Easter eggs e mensagens secretas funcionam como detalhe de apresentação, mas
  devem ser removidos ou desativados em uma ferramenta policial real.
- Textos comerciais muito enfáticos devem continuar usando expressões como
  “protótipo”, “planejado” e “preparado para”, evitando promessas não validadas.
- Formulários que hoje apenas registram em memória precisam de persistência,
  consentimento e política de retenção antes de uso real.

## Cobertura do exercício de banco de dados

| Exigência | Implementação |
|---|---|
| Identificador único do caso | `cases.case_id` e `cases.case_code` único |
| Descrição, data, cidade e status | `cases` + `cities` |
| Vítimas, idade, ocupação e relação | `people` + `case_victims` |
| Suspeitos, apelido, histórico e vínculo | `suspect_profiles` + `case_suspects` |
| Testemunhas, contato, depoimento e confiabilidade | `case_witnesses` |
| Evidências, descoberta, local e perícia | `evidence` + `forensic_analyses` |
| Investigadores, especialidade e histórico | `investigators` + `case_investigators` + view calculada |
| Arquivamento e reabertura | `case_status_history` |
| Casos mais antigos sem solução | consulta 1 |
| Casos com mais evidências | consulta 2 |
| Testemunhas recorrentes | view e relatório adicional |
| Dez consultas solicitadas | `database/03_queries.sql` |

## Pontos de atenção do enunciado

1. Há ambiguidade entre “nos últimos 20 anos” e a ideia de casos antigos. Foram
   entregues duas versões; a principal lista casos não resolvidos com mais de 20
   anos.
2. “Histórico de casos resolvidos” do investigador não deve ser texto duplicado.
   Ele é calculado a partir das associações e do status dos casos.
3. Idade atual é inadequada para crimes antigos. A modelagem registra a idade no
   momento da ocorrência, do vínculo ou do depoimento.
4. Uma evidência pode passar por mais de uma perícia, por isso as análises ficam
   em tabela própria.

## Próxima etapa para transformar a demo em sistema

1. Adicionar Entity Framework Core e o provedor MySQL compatível com .NET 10.
2. Criar entidades de domínio e um `UnsolvedDbContext` equivalentes ao schema.
3. Guardar a connection string em User Secrets ou variável de ambiente.
4. Substituir gradualmente `DemoDataService` por repositórios assíncronos.
5. Implementar autenticação real, autorização por perfil e trilha de auditoria.
6. Criar migrations, testes de integração e paginação das consultas.
7. Somente depois conectar formulários e operações de escrita.

## Critério de conclusão acadêmica

A entrega fica completa quando o schema e a carga executam em MySQL 8, as dez
consultas retornam resultados, o diagrama é apresentado e o pitch de 5–7 minutos
explica problema, público, funções, banco, diferenciais e chamada para ação.

