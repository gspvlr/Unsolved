# Diagrama entidade-relacionamento

O diagrama mostra as entidades centrais. Tabelas associativas preservam papéis
distintos da mesma pessoa em cada caso e evitam duplicação de dados.

```mermaid
erDiagram
    CITIES ||--o{ CASES : localiza
    CASES ||--o{ CASE_VICTIMS : possui
    PEOPLE ||--o{ CASE_VICTIMS : participa
    PEOPLE ||--o| SUSPECT_PROFILES : especializa
    CASES ||--o{ CASE_SUSPECTS : investiga
    SUSPECT_PROFILES ||--o{ CASE_SUSPECTS : relaciona
    CASES ||--o{ CASE_WITNESSES : registra
    PEOPLE ||--o{ CASE_WITNESSES : depõe
    CASES ||--o{ CASE_INVESTIGATORS : atribui
    INVESTIGATORS ||--o{ CASE_INVESTIGATORS : atua
    CASES ||--o{ EVIDENCE : reúne
    INVESTIGATORS o|--o{ EVIDENCE : coleta
    EVIDENCE ||--o{ FORENSIC_ANALYSES : recebe
    CASES ||--o{ CASE_STATUS_HISTORY : percorre
    INVESTIGATORS o|--o{ CASE_STATUS_HISTORY : altera

    CASES {
      bigint case_id PK
      varchar case_code UK
      text crime_description
      date crime_occurred_on
      bigint city_id FK
      enum status
      enum priority
    }
    PEOPLE {
      bigint person_id PK
      varchar full_name
      date birth_date
    }
    EVIDENCE {
      bigint evidence_id PK
      bigint case_id FK
      varchar evidence_code UK
      enum evidence_type
      date discovered_on
      varchar found_location
    }
    FORENSIC_ANALYSES {
      bigint analysis_id PK
      bigint evidence_id FK
      enum analysis_type
      enum analysis_status
      boolean is_available
    }
```

## Regras principais

- Um caso pertence a uma cidade e pode ter muitas vítimas, suspeitos,
  testemunhas, evidências, atribuições e mudanças de status.
- Uma pessoa pode aparecer em vários casos e até exercer papéis diferentes.
- Um item de evidência pode ter nenhuma, uma ou várias análises periciais.
- Um investigador pode atuar em vários casos; casos resolvidos são calculados
  pelo relacionamento, não digitados manualmente.

