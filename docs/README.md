# Documentação do Unsolved

Este diretório concentra os documentos de análise, arquitetura e apresentação
do projeto. Os scripts executáveis do MySQL permanecem em [`../database`](../database/README.md).

## Análise

- [`analysis/ANALISE_E_REQUISITOS.md`](analysis/ANALISE_E_REQUISITOS.md) — comparação
  dos anexos com o projeto, decisões de escopo, pontos que não fazem sentido e
  próximos passos.

## Arquitetura de dados

- [`architecture/diagrama-conceitual-unsolved.png`](architecture/diagrama-conceitual-unsolved.png)
  — versão relacional com as referências PK/FK, pronta para README e apresentação.
- [`architecture/diagrama-conceitual-unsolved.svg`](architecture/diagrama-conceitual-unsolved.svg)
  — versão vetorial editável do diagrama relacional.
- [`architecture/assets/unsolved-logo-transparente.png`](architecture/assets/unsolved-logo-transparente.png)
  — mascote isolada em PNG com fundo transparente.
- [`architecture/ERD.md`](architecture/ERD.md) — modelo relacional e regras de negócio.
- [`architecture/erd.svg`](architecture/erd.svg) — diagrama pronto para visualização.
- [`architecture/erd.dot`](architecture/erd.dot) — fonte editável do diagrama.

## Apresentação

- [`presentation/Unsolved_Pitch_MySQL.pptx`](presentation/Unsolved_Pitch_MySQL.pptx)
  — apresentação final do projeto.
- [`presentation/ROTEIRO.md`](presentation/ROTEIRO.md) — sequência, tempo e orientação
  para a fala.
- [`presentation/assets`](presentation/assets) — imagens utilizadas na apresentação.

## Onde começar

1. Leia o [`README` principal](../README.md) para executar o site e o MySQL.
2. Consulte a análise para entender o que já está pronto e o que ainda falta.
3. Use o ERD junto dos scripts em `database` ao iniciar a integração com o banco.
