-- Unsolved - consultas solicitadas no exercicio.
-- MySQL 8.0+. Execute depois de 01_schema.sql e 02_seed.sql.

USE unsolved_db;

-- 1) Crimes nao resolvidos ha mais de 20 anos.
-- Interpretacao adotada para conciliar o titulo do item com o filtro temporal.
SELECT
  c.case_code,
  c.title,
  c.crime_occurred_on,
  ci.name AS city,
  c.status,
  TIMESTAMPDIFF(YEAR, c.crime_occurred_on, CURRENT_DATE()) AS years_open
FROM cases AS c
JOIN cities AS ci ON ci.city_id = c.city_id
WHERE c.status <> 'RESOLVIDO'
  AND c.crime_occurred_on < DATE_SUB(CURRENT_DATE(), INTERVAL 20 YEAR)
ORDER BY c.crime_occurred_on;

-- Variante 1B: se o professor considerar literalmente "nos ultimos 20 anos",
-- troque o filtro anterior por este bloco.
SELECT
  c.case_code,
  c.title,
  c.crime_occurred_on,
  ci.name AS city,
  c.status
FROM cases AS c
JOIN cities AS ci ON ci.city_id = c.city_id
WHERE c.status <> 'RESOLVIDO'
  AND c.crime_occurred_on >= DATE_SUB(CURRENT_DATE(), INTERVAL 20 YEAR)
ORDER BY c.crime_occurred_on;

-- 2) Casos ordenados pela quantidade de evidencias, do maior para o menor.
SELECT
  case_code,
  title,
  status,
  evidence_count
FROM vw_case_evidence_counts
ORDER BY evidence_count DESC, case_code;

-- 3) Suspeitos vinculados a mais de um caso arquivado.
SELECT
  p.person_id,
  p.full_name,
  COUNT(DISTINCT c.case_id) AS archived_case_count,
  GROUP_CONCAT(DISTINCT c.case_code ORDER BY c.case_code SEPARATOR ', ')
    AS archived_cases
FROM people AS p
JOIN case_suspects AS cs ON cs.person_id = p.person_id
JOIN cases AS c ON c.case_id = cs.case_id
WHERE c.status = 'ARQUIVADO'
GROUP BY p.person_id, p.full_name
HAVING COUNT(DISTINCT c.case_id) > 1
ORDER BY archived_case_count DESC, p.full_name;

-- 4) Testemunhas de alta confiabilidade e seus depoimentos.
SELECT
  p.full_name AS witness_name,
  c.case_code,
  c.title AS case_title,
  cw.statement_recorded_on,
  cw.statement_text,
  cw.contact_information
FROM case_witnesses AS cw
JOIN people AS p ON p.person_id = cw.person_id
JOIN cases AS c ON c.case_id = cw.case_id
WHERE cw.reliability = 'ALTA'
ORDER BY p.full_name, cw.statement_recorded_on;

-- 5) Cidades ordenadas pela quantidade de casos arquivados.
SELECT
  ci.name AS city,
  ci.state_code,
  COUNT(c.case_id) AS archived_case_count
FROM cities AS ci
JOIN cases AS c ON c.city_id = ci.city_id
WHERE c.status = 'ARQUIVADO'
GROUP BY ci.city_id, ci.name, ci.state_code
ORDER BY archived_case_count DESC, ci.name;

-- 6) Evidencias descobertas nos ultimos seis meses.
SELECT
  e.evidence_code,
  e.description,
  e.evidence_type,
  e.discovered_on,
  e.found_location,
  c.case_code,
  c.title AS case_title
FROM evidence AS e
JOIN cases AS c ON c.case_id = e.case_id
WHERE e.discovered_on >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
ORDER BY e.discovered_on DESC, e.evidence_code;

-- 7) Evidencias que possuem analise de DNA, disponivel ou pendente.
SELECT
  e.evidence_code,
  c.case_code,
  e.description,
  fa.analysis_status,
  fa.is_available,
  fa.requested_on,
  fa.performed_on,
  fa.laboratory,
  fa.result_summary
FROM forensic_analyses AS fa
JOIN evidence AS e ON e.evidence_id = fa.evidence_id
JOIN cases AS c ON c.case_id = e.case_id
WHERE fa.analysis_type = 'DNA'
ORDER BY fa.is_available DESC, fa.requested_on DESC;

-- 8) Investigadores ordenados pela quantidade de casos resolvidos.
SELECT
  investigator_id,
  full_name,
  specialty,
  resolved_case_count
FROM vw_investigator_resolved_case_counts
ORDER BY resolved_case_count DESC, full_name;

-- 9) Casos nao resolvidos associados a um suspeito informado.
-- Altere o valor abaixo para testar outro nome.
SET @suspect_name = 'Mauro Tavares';

SELECT
  p.full_name AS suspect_name,
  cs.alias_used,
  c.case_code,
  c.title,
  c.status,
  c.crime_occurred_on,
  cs.link_to_crime
FROM people AS p
JOIN case_suspects AS cs ON cs.person_id = p.person_id
JOIN cases AS c ON c.case_id = cs.case_id
WHERE p.full_name = @suspect_name
  AND c.status <> 'RESOLVIDO'
ORDER BY c.crime_occurred_on;

-- 10) Media de idade das vitimas e perfil por ocupacao.
-- A idade usada e a registrada no momento da ocorrencia, evitando distorcao
-- em casos antigos.
SELECT
  COALESCE(cv.occupation_at_time, 'Nao informada') AS occupation,
  COUNT(*) AS victim_count,
  ROUND(AVG(cv.age_at_occurrence), 1) AS average_age_at_occurrence,
  MIN(cv.age_at_occurrence) AS youngest_age,
  MAX(cv.age_at_occurrence) AS oldest_age,
  GROUP_CONCAT(
    DISTINCT cv.victim_profile
    ORDER BY cv.victim_profile
    SEPARATOR ' | '
  ) AS profile_summary
FROM case_victims AS cv
GROUP BY COALESCE(cv.occupation_at_time, 'Nao informada')
ORDER BY victim_count DESC, occupation;

-- Relatorio adicional exigido: testemunhas que aparecem em mais de um caso.
SELECT
  rw.full_name AS recurring_witness,
  rw.case_count,
  GROUP_CONCAT(DISTINCT c.case_code ORDER BY c.case_code SEPARATOR ', ')
    AS cases
FROM vw_recurring_witnesses AS rw
JOIN case_witnesses AS cw ON cw.person_id = rw.person_id
JOIN cases AS c ON c.case_id = cw.case_id
GROUP BY rw.person_id, rw.full_name, rw.case_count
ORDER BY rw.case_count DESC, rw.full_name;

