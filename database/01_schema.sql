-- Unsolved - esquema relacional para MySQL 8.0+
-- Este script cria o banco e as estruturas sem armazenar credenciais.

CREATE DATABASE IF NOT EXISTS unsolved_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE unsolved_db;

CREATE TABLE IF NOT EXISTS cities (
  city_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  state_code CHAR(2) NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'BR',
  PRIMARY KEY (city_id),
  CONSTRAINT uq_cities_name_state_country
    UNIQUE (name, state_code, country_code)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS cases (
  case_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_code VARCHAR(30) NOT NULL,
  title VARCHAR(180) NOT NULL,
  crime_description TEXT NOT NULL,
  crime_occurred_on DATE NOT NULL,
  opened_on DATE NOT NULL,
  closed_on DATE NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  status ENUM('ARQUIVADO', 'EM_REABERTURA', 'EM_ANDAMENTO', 'RESOLVIDO')
    NOT NULL DEFAULT 'EM_ANDAMENTO',
  priority ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')
    NOT NULL DEFAULT 'MEDIA',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id),
  CONSTRAINT uq_cases_case_code UNIQUE (case_code),
  CONSTRAINT fk_cases_city
    FOREIGN KEY (city_id) REFERENCES cities (city_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_cases_dates
    CHECK (closed_on IS NULL OR closed_on >= opened_on),
  CONSTRAINT ck_cases_resolved_closed
    CHECK (status <> 'RESOLVIDO' OR closed_on IS NOT NULL),
  INDEX ix_cases_status_occurred (status, crime_occurred_on),
  INDEX ix_cases_city_status (city_id, status)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS people (
  person_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(160) NOT NULL,
  birth_date DATE NULL,
  profile_notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (person_id),
  INDEX ix_people_full_name (full_name)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS case_victims (
  case_id BIGINT UNSIGNED NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  age_at_occurrence TINYINT UNSIGNED NULL,
  occupation_at_time VARCHAR(160) NULL,
  relationship_to_case VARCHAR(255) NOT NULL,
  victim_profile VARCHAR(500) NULL,
  PRIMARY KEY (case_id, person_id),
  CONSTRAINT fk_case_victims_case
    FOREIGN KEY (case_id) REFERENCES cases (case_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_case_victims_person
    FOREIGN KEY (person_id) REFERENCES people (person_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_case_victims_age
    CHECK (age_at_occurrence IS NULL OR age_at_occurrence <= 120),
  INDEX ix_case_victims_person (person_id),
  INDEX ix_case_victims_occupation (occupation_at_time)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS suspect_profiles (
  person_id BIGINT UNSIGNED NOT NULL,
  criminal_history TEXT NULL,
  risk_notes VARCHAR(500) NULL,
  PRIMARY KEY (person_id),
  CONSTRAINT fk_suspect_profiles_person
    FOREIGN KEY (person_id) REFERENCES people (person_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS case_suspects (
  case_id BIGINT UNSIGNED NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  alias_used VARCHAR(120) NULL,
  age_when_linked TINYINT UNSIGNED NULL,
  link_to_crime TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (case_id, person_id),
  CONSTRAINT fk_case_suspects_case
    FOREIGN KEY (case_id) REFERENCES cases (case_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_case_suspects_person
    FOREIGN KEY (person_id) REFERENCES suspect_profiles (person_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_case_suspects_age
    CHECK (age_when_linked IS NULL OR age_when_linked <= 120),
  INDEX ix_case_suspects_person (person_id),
  INDEX ix_case_suspects_primary (case_id, is_primary)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS case_witnesses (
  case_id BIGINT UNSIGNED NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  contact_information VARCHAR(255) NULL,
  statement_text TEXT NOT NULL,
  reliability ENUM('BAIXA', 'MEDIA', 'ALTA') NOT NULL DEFAULT 'MEDIA',
  statement_recorded_on DATE NOT NULL,
  age_at_statement TINYINT UNSIGNED NULL,
  PRIMARY KEY (case_id, person_id),
  CONSTRAINT fk_case_witnesses_case
    FOREIGN KEY (case_id) REFERENCES cases (case_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_case_witnesses_person
    FOREIGN KEY (person_id) REFERENCES people (person_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_case_witnesses_age
    CHECK (age_at_statement IS NULL OR age_at_statement <= 120),
  INDEX ix_case_witnesses_person (person_id),
  INDEX ix_case_witnesses_reliability (reliability)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS investigators (
  investigator_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(160) NOT NULL,
  badge_number VARCHAR(40) NULL,
  specialty VARCHAR(160) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (investigator_id),
  CONSTRAINT uq_investigators_badge UNIQUE (badge_number),
  INDEX ix_investigators_full_name (full_name)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS case_investigators (
  case_id BIGINT UNSIGNED NOT NULL,
  investigator_id BIGINT UNSIGNED NOT NULL,
  assigned_on DATE NOT NULL,
  released_on DATE NULL,
  is_lead BOOLEAN NOT NULL DEFAULT FALSE,
  assignment_notes VARCHAR(500) NULL,
  PRIMARY KEY (case_id, investigator_id, assigned_on),
  CONSTRAINT fk_case_investigators_case
    FOREIGN KEY (case_id) REFERENCES cases (case_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_case_investigators_investigator
    FOREIGN KEY (investigator_id) REFERENCES investigators (investigator_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_case_investigators_dates
    CHECK (released_on IS NULL OR released_on >= assigned_on),
  INDEX ix_case_investigators_investigator (investigator_id),
  INDEX ix_case_investigators_lead (case_id, is_lead)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS evidence (
  evidence_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_id BIGINT UNSIGNED NOT NULL,
  evidence_code VARCHAR(40) NOT NULL,
  description TEXT NOT NULL,
  evidence_type ENUM(
    'DOCUMENTO', 'FOTO', 'FISICA', 'DIGITAL', 'BIOLOGICA', 'OUTRA'
  ) NOT NULL,
  discovered_on DATE NOT NULL,
  found_location VARCHAR(255) NOT NULL,
  custody_status ENUM(
    'CATALOGADA', 'EM_ANALISE', 'ARMAZENADA', 'DEVOLVIDA', 'DESCARTADA'
  ) NOT NULL DEFAULT 'CATALOGADA',
  collected_by_investigator_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evidence_id),
  CONSTRAINT uq_evidence_code UNIQUE (evidence_code),
  CONSTRAINT fk_evidence_case
    FOREIGN KEY (case_id) REFERENCES cases (case_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_evidence_collector
    FOREIGN KEY (collected_by_investigator_id)
      REFERENCES investigators (investigator_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX ix_evidence_case_discovered (case_id, discovered_on),
  INDEX ix_evidence_discovered (discovered_on),
  INDEX ix_evidence_type (evidence_type)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS forensic_analyses (
  analysis_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  evidence_id BIGINT UNSIGNED NOT NULL,
  analysis_type ENUM(
    'DNA', 'BALISTICA', 'IMPRESSAO_DIGITAL', 'DIGITAL', 'DOCUMENTAL', 'OUTRA'
  ) NOT NULL,
  analysis_status ENUM('PENDENTE', 'CONCLUIDA', 'INCONCLUSIVA')
    NOT NULL DEFAULT 'PENDENTE',
  is_available BOOLEAN NOT NULL DEFAULT FALSE,
  requested_on DATE NOT NULL,
  performed_on DATE NULL,
  laboratory VARCHAR(160) NULL,
  result_summary TEXT NULL,
  PRIMARY KEY (analysis_id),
  CONSTRAINT fk_forensic_analyses_evidence
    FOREIGN KEY (evidence_id) REFERENCES evidence (evidence_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT ck_forensic_analyses_dates
    CHECK (performed_on IS NULL OR performed_on >= requested_on),
  CONSTRAINT ck_forensic_analyses_availability
    CHECK (is_available = FALSE OR performed_on IS NOT NULL),
  INDEX ix_forensic_analysis_type_available (analysis_type, is_available),
  INDEX ix_forensic_analysis_evidence (evidence_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS case_status_history (
  status_history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_id BIGINT UNSIGNED NOT NULL,
  previous_status ENUM(
    'ARQUIVADO', 'EM_REABERTURA', 'EM_ANDAMENTO', 'RESOLVIDO'
  ) NULL,
  new_status ENUM(
    'ARQUIVADO', 'EM_REABERTURA', 'EM_ANDAMENTO', 'RESOLVIDO'
  ) NOT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NOT NULL,
  changed_by_investigator_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (status_history_id),
  CONSTRAINT fk_status_history_case
    FOREIGN KEY (case_id) REFERENCES cases (case_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_status_history_investigator
    FOREIGN KEY (changed_by_investigator_id)
      REFERENCES investigators (investigator_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX ix_status_history_case_changed (case_id, changed_at),
  INDEX ix_status_history_new_status (new_status)
) ENGINE = InnoDB;

CREATE OR REPLACE VIEW vw_case_evidence_counts AS
SELECT
  c.case_id,
  c.case_code,
  c.title,
  c.status,
  COUNT(e.evidence_id) AS evidence_count
FROM cases AS c
LEFT JOIN evidence AS e ON e.case_id = c.case_id
GROUP BY c.case_id, c.case_code, c.title, c.status;

CREATE OR REPLACE VIEW vw_investigator_resolved_case_counts AS
SELECT
  i.investigator_id,
  i.full_name,
  i.specialty,
  COUNT(DISTINCT CASE WHEN c.status = 'RESOLVIDO' THEN c.case_id END)
    AS resolved_case_count
FROM investigators AS i
LEFT JOIN case_investigators AS ci
  ON ci.investigator_id = i.investigator_id
LEFT JOIN cases AS c ON c.case_id = ci.case_id
GROUP BY i.investigator_id, i.full_name, i.specialty;

CREATE OR REPLACE VIEW vw_recurring_witnesses AS
SELECT
  p.person_id,
  p.full_name,
  COUNT(DISTINCT cw.case_id) AS case_count
FROM people AS p
JOIN case_witnesses AS cw ON cw.person_id = p.person_id
GROUP BY p.person_id, p.full_name
HAVING COUNT(DISTINCT cw.case_id) > 1;

