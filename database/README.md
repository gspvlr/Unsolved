# Banco de dados MySQL

O diretório contém a entrega acadêmica do banco do **Unsolved**. Todo o
conteúdo da carga é fictício.

## Ordem dos scripts

1. `00_reset.sql` — opcional e destrutivo; remove o banco da demonstração.
2. `01_schema.sql` — cria o banco, tabelas, chaves, índices, restrições e views.
3. `02_seed.sql` — carrega dados fictícios suficientes para validar os relatórios.
4. `03_queries.sql` — executa as 10 consultas do exercício e o relatório extra
   de testemunhas recorrentes.

## Execução pelo terminal

Com o cliente `mysql` instalado:

```bash
mysql -u root -p < database/01_schema.sql
mysql -u root -p < database/02_seed.sql
mysql -u root -p < database/03_queries.sql
```

Para recriar tudo:

```bash
mysql -u root -p < database/00_reset.sql
mysql -u root -p < database/01_schema.sql
mysql -u root -p < database/02_seed.sql
```

## Execução com Docker

Na raiz do projeto:

```bash
cp .env.example .env
docker compose up -d
docker compose exec mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

Os scripts `01_schema.sql` e `02_seed.sql` são aplicados automaticamente apenas
na primeira inicialização do volume. Se alterar os scripts depois, execute-os
manualmente ou remova o volume somente quando não houver dados importantes.

## Decisões de modelagem

- `people` guarda a identidade central; tabelas associativas registram o papel
  da pessoa em cada caso.
- Idades históricas ficam na relação com o caso, pois a idade atual não responde
  corretamente a ocorrências antigas.
- O histórico criminal pertence ao perfil do suspeito, enquanto o vínculo com
  o crime pertence a `case_suspects`.
- Resultados periciais ficam separados da evidência para permitir várias
  análises sobre o mesmo item.
- O histórico de status registra arquivamentos e reaberturas sem sobrescrever a
  trajetória do caso.
- O histórico de casos resolvidos por investigador é calculado, não duplicado.

## Ambiguidade do enunciado

O documento menciona “crimes não resolvidos nos últimos 20 anos”, mas o título
da consulta indica casos antigos. `03_queries.sql` inclui as duas variantes. A
consulta 1 principal usa **mais de 20 anos**; a consulta 1B usa **nos últimos 20
anos**.
