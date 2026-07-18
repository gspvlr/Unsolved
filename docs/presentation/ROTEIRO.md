# Roteiro do pitch — Unsolved

Tempo planejado: **6 minutos e 25 segundos**, dentro do intervalo solicitado de
5–7 minutos. As mesmas orientações estão nas notas do apresentador do PowerPoint.

## 1. Abertura — 40 s

- Apresentar nome, identidade visual e slogan.
- Definir o Unsolved como proposta acadêmica para organizar cold cases e ligar
  pistas dispersas.
- Antecipar: há uma demonstração visual e uma prova técnica em MySQL.

## 2. Problema e público — 45 s

- Informações em relatórios separados dificultam reconhecer padrões.
- Um caso antigo pode ganhar nova relevância com DNA ou uma testemunha
  recorrente.
- Público: investigação, perícia e gestores; no contexto acadêmico, alunos e
  professores também podem explorar a base.

## 3. Solução e demonstração — 55 s

- Mostrar que a imagem é uma captura real da demonstração.
- Percorrer as cinco funções: caso, pessoas por papel, evidências, histórico e
  relatórios.
- Ser transparente: o painel atual ainda usa dados em memória.

## 4. Storyboard — 50 s

- Cadastrar o caso.
- Relacionar pessoas, investigadores, depoimentos e evidências.
- Cruzar dados por tempo, cidade, DNA e recorrência.
- Reabrir o caso e registrar a mudança de status.

## 5. Banco MySQL — 65 s

- Pessoas são reutilizadas em diferentes papéis.
- Uma evidência pode receber várias análises periciais.
- O histórico de status preserva arquivamentos e reaberturas.
- A idade fica registrada no momento do fato ou depoimento.
- Casos resolvidos por investigador são calculados, não duplicados em texto.

## 6. Consultas e relatórios — 55 s

- A carga fictícia produz resultados para todas as consultas.
- Exemplos fortes: casos antigos, quantidade de evidências, DNA e recorrência.
- Explicar que a ambiguidade dos 20 anos foi tratada com duas versões no SQL.

## 7. Roadmap — 40 s

- Entrega atual: schema, seed, consultas, ERD, Docker, documentação e pitch.
- Próxima fase: EF Core, provedor MySQL, `DbContext`, migrations e serviços.
- Produção: autenticação, autorização, auditoria, testes, backup e retenção.

## 8. Chamada para ação — 35 s

- Pedir aprovação do modelo.
- Convidar a turma/professor a executar as consultas.
- Propor o início da integração do painel ao MySQL.
- Fechar com: **Pistas conectadas. Respostas possíveis.**

## Plano de demonstração opcional

Se houver tempo, abrir `/sistema/painel`, mostrar um caso e depois abrir
`database/03_queries.sql`. Evitar cadastrar informações pessoais ou casos reais.

