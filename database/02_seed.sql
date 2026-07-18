-- Unsolved - massa de dados 100% ficticia para demonstracao academica.
-- Para recarregar do zero, execute 00_reset.sql e depois 01_schema.sql.

USE unsolved_db;

START TRANSACTION;

INSERT INTO cities (city_id, name, state_code, country_code) VALUES
  (1, 'Sao Paulo', 'SP', 'BR'),
  (2, 'Rio de Janeiro', 'RJ', 'BR'),
  (3, 'Porto Alegre', 'RS', 'BR'),
  (4, 'Recife', 'PE', 'BR'),
  (5, 'Manaus', 'AM', 'BR'),
  (6, 'Belo Horizonte', 'MG', 'BR'),
  (7, 'Curitiba', 'PR', 'BR'),
  (8, 'Salvador', 'BA', 'BR');

INSERT INTO investigators (
  investigator_id, full_name, badge_number, specialty, active
) VALUES
  (1, 'Marina Duarte', 'INV-1042', 'Analise comportamental', TRUE),
  (2, 'Rafael Nunes', 'INV-1178', 'Pericia digital', TRUE),
  (3, 'Camila Torres', 'INV-0981', 'Crimes contra a pessoa', TRUE),
  (4, 'Diego Martins', 'INV-1255', 'Inteligencia e vinculos', TRUE),
  (5, 'Livia Araujo', 'INV-1310', 'Genetica forense', TRUE);

INSERT INTO people (
  person_id, full_name, birth_date, profile_notes
) VALUES
  (1, 'Ana Beatriz Lima', '1969-05-18', 'Vitima principal do caso da estacao.'),
  (2, 'Paulo Henrique Reis', '1966-02-03', 'Comerciante conhecido no centro antigo.'),
  (3, 'Clara Menezes', '1977-09-12', 'Pesquisadora ligada ao arquivo portuario.'),
  (4, 'Renato Alves', '1963-04-28', 'Jornalista que investigava contratos publicos.'),
  (5, 'Joana Silva Prado', '1981-11-19', 'Tecnica de telecomunicacoes.'),
  (6, 'Eduardo Campos Luz', '1974-01-07', 'Hospede registrado no quarto 312.'),
  (7, 'Marcia Oliveira', '1982-08-22', 'Motorista da linha intermunicipal.'),
  (8, 'Daniel Kato', '1987-06-30', 'Arquiteto e colecionador de chaves antigas.'),
  (9, 'Sonia Batista', '1990-03-16', 'Pescadora da comunidade local.'),
  (10, 'Leandro Gomes', '1992-10-04', 'Operador de manutencao predial.'),
  (11, 'Patricia Rosa', '1988-12-09', 'Analista administrativa.'),
  (12, 'Carlos Viana', '1995-07-25', 'Mensageiro autonomo.'),
  (13, 'Mauro Tavares', '1968-07-01', 'Pessoa de interesse recorrente em casos arquivados.'),
  (14, 'Lucia Farias', '1972-01-17', 'Ex-funcionaria da administracao portuaria.'),
  (15, 'Gilberto Mota', '1961-10-02', 'Antigo intermediario de documentos.'),
  (16, 'Paula Montenegro', '1984-05-15', 'Tecnica com acesso a redes de comunicacao.'),
  (17, 'Vitor Salgado', '1979-03-21', 'Proprietario de empresa de transporte.'),
  (18, 'Nadia Ferraz', '1989-11-08', 'Consultora com acesso ao predio investigado.'),
  (19, 'Bruno Seixas', '1991-02-14', 'Especialista autonomo em dispositivos digitais.'),
  (20, 'Elias Moura', '1983-06-06', 'Ex-prestador de servicos no porto.'),
  (21, 'Helena Costa', '1958-04-09', 'Testemunha recorrente em tres inqueritos antigos.'),
  (22, 'Roberto Assis', '1970-09-18', 'Vigia noturno aposentado.'),
  (23, 'Irene Lopes', '1985-12-20', 'Moradora proxima ao local do crime.'),
  (24, 'Tiago Freire', '1993-07-12', 'Motorista de aplicativo.'),
  (25, 'Celia Barros', '1965-06-24', 'Ex-recepcionista de hotel.'),
  (26, 'Fabio Neves', '1988-02-11', 'Tecnico de seguranca eletronica.'),
  (27, 'Rita Souza', '1976-08-31', 'Comerciante do bairro.'),
  (28, 'Marcelo Antunes', '1996-05-29', 'Entregador que presenciou movimentacao incomum.');

INSERT INTO suspect_profiles (person_id, criminal_history, risk_notes) VALUES
  (13, 'Fraude documental em 1996; investigacao por receptacao em 2000.',
   'Usou identidades diferentes e aparece em tres casos arquivados.'),
  (14, 'Sem condenacoes; citada em sindicancia administrativa em 2002.',
   'Conhecia rotinas e acessos do arquivo.'),
  (15, 'Condenacao por falsificacao de documentos em 1994.',
   'Pode ter intermediado material retirado do local.'),
  (16, 'Advertencia profissional por acesso indevido a rede interna.',
   'Conhecimento tecnico compativel com a interrupcao do sinal.'),
  (17, 'Processo por transporte irregular encerrado sem condenacao.',
   'Controlava veiculos da rota investigada.'),
  (18, 'Sem antecedentes conhecidos.',
   'Credencial de acesso registrada no dia do fato.'),
  (19, 'Investigacao anterior por clonagem de dispositivos.',
   'Possui ferramentas compativeis com os vestigios digitais.'),
  (20, 'Ocorrencias por invasao de propriedade em 2019.',
   'Conhecia os acessos secundarios da area portuaria.');

INSERT INTO cases (
  case_id, case_code, title, crime_description, crime_occurred_on,
  opened_on, closed_on, city_id, status, priority
) VALUES
  (1, 'UNS-1998-001', 'A Mala da Estacao',
   'Desaparecimento seguido da localizacao de objetos pessoais em uma mala abandonada na estacao central.',
   '1998-08-14', '1998-08-15', NULL, 3, 'ARQUIVADO', 'ALTA'),
  (2, 'UNS-2001-014', 'Ecos do Viaduto',
   'Homicidio sem autoria definida ocorrido sob um viaduto, com documentos possivelmente adulterados.',
   '2001-04-21', '2001-04-21', NULL, 1, 'ARQUIVADO', 'CRITICA'),
  (3, 'UNS-2003-022', 'Arquivo do Porto',
   'Desaparecimento de pesquisadora e retirada irregular de caixas do arquivo portuario.',
   '2003-11-02', '2003-11-03', NULL, 4, 'EM_REABERTURA', 'CRITICA'),
  (4, 'UNS-2004-031', 'Noite no Catete',
   'Morte de jornalista apos encontro nao identificado; gravacoes originais nao foram localizadas.',
   '2004-07-19', '2004-07-20', NULL, 2, 'ARQUIVADO', 'ALTA'),
  (5, 'UNS-2009-008', 'Sinal Interrompido',
   'Desaparecimento durante pane simultanea em antenas e cameras de uma central de telecomunicacoes.',
   '2009-01-30', '2009-01-30', NULL, 5, 'EM_ANDAMENTO', 'ALTA'),
  (6, 'UNS-2012-019', 'Quarto 312',
   'Homicidio em hotel esclarecido apos confronto de registros de acesso e perfil genetico.',
   '2012-05-11', '2012-05-11', '2018-02-20', 6, 'RESOLVIDO', 'MEDIA'),
  (7, 'UNS-2015-027', 'Rota 17',
   'Desaparecimento de motorista durante trajeto alterado sem autorizacao.',
   '2015-09-03', '2015-09-04', NULL, 1, 'ARQUIVADO', 'ALTA'),
  (8, 'UNS-2018-042', 'A Chave Azul',
   'Invasao seguida de homicidio solucionada por impressao digital e registro de chave codificada.',
   '2018-12-17', '2018-12-17', '2021-06-10', 7, 'RESOLVIDO', 'MEDIA'),
  (9, 'UNS-2021-011', 'Mare Baixa',
   'Desaparecimento de pescadora apos embarcacao retornar sem tripulacao.',
   '2021-03-22', '2021-03-22', NULL, 8, 'EM_ANDAMENTO', 'ALTA'),
  (10, 'UNS-2023-006', 'Linha de Cinza',
   'Morte suspeita em predio comercial reaberta apos recuperacao de imagens apagadas.',
   '2023-06-09', '2023-06-09', NULL, 2, 'EM_REABERTURA', 'CRITICA'),
  (11, 'UNS-2024-018', 'Sala Sem Janela',
   'Desaparecimento em escritorio com acesso controlado e sem registro de saida.',
   '2024-10-12', '2024-10-12', NULL, 1, 'ARQUIVADO', 'ALTA'),
  (12, 'UNS-2026-004', 'Ultimo Bilhete',
   'Mensageiro desaparecido apos registrar uma entrega sem destinatario confirmado.',
   '2026-02-15', '2026-02-15', NULL, 4, 'EM_ANDAMENTO', 'CRITICA');

INSERT INTO case_victims (
  case_id, person_id, age_at_occurrence, occupation_at_time,
  relationship_to_case, victim_profile
) VALUES
  (1, 1, 29, 'Fotografa', 'Pessoa desaparecida e proprietaria dos objetos.', 'Trabalhava em reportagens urbanas.'),
  (2, 2, 35, 'Comerciante', 'Vitima fatal localizada no local.', 'Mantinha comercio no centro e fazia cobrancas externas.'),
  (3, 3, 26, 'Pesquisadora', 'Pessoa desaparecida durante pesquisa documental.', 'Estudava registros de cargas antigas.'),
  (4, 4, 41, 'Jornalista', 'Vitima fatal e autor de anotacoes apreendidas.', 'Investigava contratos e empresas de fachada.'),
  (5, 5, 27, 'Tecnica de telecomunicacoes', 'Pessoa desaparecida durante o turno.', 'Tinha acesso aos equipamentos de sinal.'),
  (6, 6, 38, 'Representante comercial', 'Vitima fatal no quarto 312.', 'Viajava semanalmente pela regiao.'),
  (7, 7, 33, 'Motorista', 'Pessoa desaparecida durante o trajeto.', 'Conhecia rotas alternativas da empresa.'),
  (8, 8, 31, 'Arquiteto', 'Vitima fatal no imovel invadido.', 'Colecionava fechaduras e chaves raras.'),
  (9, 9, 31, 'Pescadora', 'Pessoa desaparecida da embarcacao.', 'Experiente e conhecia a costa local.'),
  (10, 10, 30, 'Operador de manutencao', 'Vitima fatal no predio comercial.', 'Responsavel por acessos tecnicos.'),
  (11, 11, 35, 'Analista administrativa', 'Pessoa desaparecida no escritorio.', 'Trabalhava com contratos internos.'),
  (12, 12, 30, 'Mensageiro', 'Pessoa desaparecida apos uma entrega.', 'Atendia rotas sob demanda por aplicativo.' );

INSERT INTO case_suspects (
  case_id, person_id, alias_used, age_when_linked, link_to_crime, is_primary
) VALUES
  (1, 13, 'M. Torres', 30, 'Assinatura semelhante em recibo encontrado na mala.', TRUE),
  (2, 13, 'Marcos', 33, 'Documento adulterado ligado ao local do crime.', TRUE),
  (2, 15, 'Giba', 40, 'Intermediou a impressao de documentos falsos.', FALSE),
  (3, 14, 'Lu Farias', 31, 'Tinha acesso ao arquivo e foi a ultima a registrar a vitima.', TRUE),
  (3, 15, 'Giba', 42, 'Contato telefonico com funcionaria na noite do fato.', FALSE),
  (4, 13, 'M. Torres', 36, 'Numero associado a ele aparece nas anotacoes da vitima.', FALSE),
  (5, 16, 'P. Monte', 25, 'Credencial usada durante a pane simultanea.', TRUE),
  (6, 18, 'N. Ferraz', 22, 'Registro de acesso e DNA vincularam a suspeita ao quarto.', TRUE),
  (7, 13, 'Marcos', 47, 'Pagamento feito a motorista pouco antes do desvio.', TRUE),
  (7, 17, 'V. Salgado', 36, 'Controlava a frota e alterou os registros da rota.', FALSE),
  (8, 19, 'B. Six', 27, 'Impressao digital e ferramenta localizada na cena.', TRUE),
  (9, 20, 'E. Moura', 37, 'Foi visto proximo ao cais e conhecia os acessos.', TRUE),
  (10, 19, 'B. Six', 32, 'Software encontrado no notebook recuperado.', TRUE),
  (11, 18, 'Nadia M.', 35, 'Credencial temporaria registrada sem justificativa.', TRUE),
  (12, 20, 'Elias M.', 42, 'Recebeu mensagem do aparelho da vitima.', TRUE);

INSERT INTO case_witnesses (
  case_id, person_id, contact_information, statement_text,
  reliability, statement_recorded_on, age_at_statement
) VALUES
  (1, 21, 'Contato preservado no inquerito fisico', 'Viu um homem retirar etiquetas da mala antes de deixa-la na plataforma.', 'ALTA', '1998-08-16', 40),
  (1, 22, 'Contato preservado no inquerito fisico', 'Relatou falha de iluminacao e um veiculo escuro na saida lateral.', 'MEDIA', '1998-08-16', 27),
  (2, 21, 'Contato preservado no inquerito fisico', 'Reconheceu o mesmo homem da estacao circulando perto do viaduto.', 'ALTA', '2001-04-22', 43),
  (2, 23, 'Contato atualizado sob sigilo', 'Ouviu discussao e identificou referencia a documentos.', 'MEDIA', '2001-04-22', 15),
  (3, 22, 'Contato atualizado sob sigilo', 'Viu caixas saindo por uma porta secundaria do arquivo.', 'ALTA', '2003-11-04', 33),
  (3, 27, 'Contato atualizado sob sigilo', 'Recebeu pedido incomum para guardar um pacote.', 'MEDIA', '2003-11-05', 27),
  (4, 21, 'Contato preservado no inquerito fisico', 'Viu um homem semelhante ao suspeito saindo do predio.', 'ALTA', '2004-07-20', 46),
  (4, 25, 'Contato atualizado sob sigilo', 'Confirmou que a vitima esperava uma visita sem registro.', 'ALTA', '2004-07-20', 39),
  (5, 26, 'Contato atualizado sob sigilo', 'Detectou comandos manuais antes da pane geral.', 'ALTA', '2009-01-31', 20),
  (6, 25, 'Contato atualizado sob sigilo', 'Viu a suspeita usar o elevador de servico.', 'ALTA', '2012-05-12', 46),
  (7, 24, 'Contato atualizado sob sigilo', 'Seguiu o onibus por parte do desvio e anotou a placa de apoio.', 'MEDIA', '2015-09-04', 22),
  (8, 26, 'Contato atualizado sob sigilo', 'Recuperou o registro da fechadura antes da substituicao.', 'ALTA', '2018-12-18', 30),
  (9, 27, 'Contato atualizado sob sigilo', 'Viu uma segunda embarcacao sem luzes perto do cais.', 'MEDIA', '2021-03-23', 44),
  (10, 26, 'Contato atualizado sob sigilo', 'Confirmou exclusao remota das imagens na madrugada.', 'ALTA', '2023-06-10', 35),
  (11, 28, 'Contato atualizado sob sigilo', 'Entregou um pacote na recepcao e viu a vitima entrar na sala.', 'ALTA', '2024-10-13', 28),
  (12, 28, 'Contato atualizado sob sigilo', 'Recebeu rota semelhante e percebeu endereco inexistente.', 'ALTA', '2026-02-16', 29);

INSERT INTO case_investigators (
  case_id, investigator_id, assigned_on, released_on, is_lead, assignment_notes
) VALUES
  (1, 1, '1998-08-15', '2000-03-01', TRUE, 'Coordenacao inicial do caso.'),
  (1, 4, '2025-09-01', NULL, FALSE, 'Revisao de vinculos historicos.'),
  (2, 3, '2001-04-21', '2004-01-15', TRUE, 'Conducao original.'),
  (2, 4, '2025-09-01', NULL, FALSE, 'Analise de suspeito recorrente.'),
  (3, 3, '2003-11-03', '2007-06-20', TRUE, 'Conducao original.'),
  (3, 4, '2025-04-11', NULL, TRUE, 'Reabertura e cruzamento de dados.'),
  (3, 5, '2025-04-11', NULL, FALSE, 'Revisao genetica.'),
  (4, 1, '2004-07-20', '2008-02-02', TRUE, 'Analise de motivacao.'),
  (5, 2, '2009-01-30', NULL, TRUE, 'Investigacao de falha digital.'),
  (5, 4, '2025-01-10', NULL, FALSE, 'Correlacao com credenciais.'),
  (6, 3, '2012-05-11', '2018-02-20', TRUE, 'Coordenacao do caso resolvido.'),
  (6, 5, '2016-08-09', '2018-02-20', FALSE, 'Analise de DNA.'),
  (7, 4, '2015-09-04', '2019-09-04', TRUE, 'Analise da rota e pagamentos.'),
  (8, 3, '2018-12-17', '2021-06-10', TRUE, 'Coordenacao do caso resolvido.'),
  (8, 2, '2018-12-18', '2021-06-10', FALSE, 'Recuperacao de acesso digital.'),
  (9, 3, '2021-03-22', NULL, TRUE, 'Investigacao em campo.'),
  (10, 2, '2025-02-04', NULL, TRUE, 'Recuperacao de imagens.'),
  (10, 1, '2025-02-04', NULL, FALSE, 'Reavaliacao de depoimentos.'),
  (11, 1, '2024-10-12', '2025-10-12', TRUE, 'Conducao ate o arquivamento.'),
  (12, 4, '2026-02-15', NULL, TRUE, 'Mapeamento de contatos e rota.'),
  (12, 2, '2026-02-15', NULL, FALSE, 'Analise do aplicativo e aparelho.');

INSERT INTO evidence (
  evidence_id, case_id, evidence_code, description, evidence_type,
  discovered_on, found_location, custody_status,
  collected_by_investigator_id
) VALUES
  (1, 1, 'EV-1998-001-A', 'Mala de couro com etiqueta parcialmente removida.', 'FISICA', '1998-08-14', 'Plataforma 4 da estacao central', 'ARMAZENADA', 1),
  (2, 1, 'EV-1998-001-B', 'Fios de cabelo preservados no forro interno.', 'BIOLOGICA', '1998-08-15', 'Interior da mala', 'EM_ANALISE', 1),
  (3, 1, 'EV-1998-001-C', 'Recibo com assinatura abreviada.', 'DOCUMENTO', '1998-08-15', 'Bolso lateral da mala', 'ARMAZENADA', 1),
  (4, 2, 'EV-2001-014-A', 'Documento de identidade com sinais de adulteracao.', 'DOCUMENTO', '2001-04-21', 'Proximo a vitima', 'ARMAZENADA', 3),
  (5, 2, 'EV-2001-014-B', 'Fotografia rasgada de encontro anterior.', 'FOTO', '2001-04-21', 'Bolso do casaco', 'ARMAZENADA', 3),
  (6, 2, 'EV-2001-014-C', 'Impressao parcial em superficie metalica.', 'FISICA', '2001-04-22', 'Pilar norte do viaduto', 'EM_ANALISE', 3),
  (7, 3, 'EV-2003-022-A', 'Tecido com material biologico nao identificado.', 'BIOLOGICA', '2003-11-03', 'Porta secundaria do arquivo', 'EM_ANALISE', 3),
  (8, 3, 'EV-2003-022-B', 'Livro de registros com paginas removidas.', 'DOCUMENTO', '2003-11-03', 'Sala de catalogacao', 'ARMAZENADA', 3),
  (9, 3, 'EV-2003-022-C', 'Fita de camera analogica recuperada.', 'FOTO', '2003-11-04', 'Guarita do porto', 'EM_ANALISE', 3),
  (10, 3, 'EV-2003-022-D', 'Disquete com indice de cargas.', 'DIGITAL', '2003-11-04', 'Mesa da pesquisadora', 'EM_ANALISE', 2),
  (11, 3, 'EV-2003-022-E', 'Lacre metalico com numeracao divergente.', 'FISICA', '2003-11-05', 'Deposito 2', 'ARMAZENADA', 4),
  (12, 4, 'EV-2004-031-A', 'Caderno com telefones e iniciais.', 'DOCUMENTO', '2004-07-19', 'Apartamento da vitima', 'ARMAZENADA', 1),
  (13, 4, 'EV-2004-031-B', 'Fita de audio com trecho danificado.', 'DIGITAL', '2004-07-20', 'Gravador da vitima', 'EM_ANALISE', 1),
  (14, 5, 'EV-2009-008-A', 'Registro de comandos executados localmente.', 'DIGITAL', '2009-01-30', 'Servidor da central', 'EM_ANALISE', 2),
  (15, 5, 'EV-2009-008-B', 'Cracha usado durante a interrupcao.', 'FISICA', '2009-01-31', 'Sala de antenas', 'ARMAZENADA', 2),
  (16, 6, 'EV-2012-019-A', 'Amostra biologica coletada no quarto.', 'BIOLOGICA', '2012-05-11', 'Quarto 312', 'ARMAZENADA', 3),
  (17, 6, 'EV-2012-019-B', 'Historico do cartao de acesso.', 'DIGITAL', '2012-05-12', 'Servidor do hotel', 'ARMAZENADA', 3),
  (18, 7, 'EV-2015-027-A', 'Registro de GPS parcialmente apagado.', 'DIGITAL', '2015-09-04', 'Garagem da empresa', 'ARMAZENADA', 4),
  (19, 7, 'EV-2015-027-B', 'Comprovante de pagamento em especie.', 'DOCUMENTO', '2015-09-05', 'Armario do motorista', 'ARMAZENADA', 4),
  (20, 8, 'EV-2018-042-A', 'Impressao digital em chave codificada.', 'FISICA', '2018-12-17', 'Escritorio da vitima', 'ARMAZENADA', 3),
  (21, 8, 'EV-2018-042-B', 'Log da fechadura eletronica.', 'DIGITAL', '2018-12-18', 'Controlador da porta', 'ARMAZENADA', 2),
  (22, 9, 'EV-2021-011-A', 'Colete com fibras de embarcacao diferente.', 'FISICA', '2021-03-23', 'Convés da embarcacao', 'EM_ANALISE', 3),
  (23, 9, 'EV-2021-011-B', 'Amostra biologica no corrimao.', 'BIOLOGICA', '2021-03-23', 'Popa da embarcacao', 'EM_ANALISE', 5),
  (24, 10, 'EV-2023-006-A', 'Imagens de camera parcialmente recuperadas.', 'DIGITAL', DATE_SUB(CURRENT_DATE(), INTERVAL 5 MONTH), 'Servidor do predio', 'EM_ANALISE', 2),
  (25, 10, 'EV-2023-006-B', 'Notebook com software de exclusao remota.', 'DIGITAL', DATE_SUB(CURRENT_DATE(), INTERVAL 4 MONTH), 'Armario tecnico', 'EM_ANALISE', 2),
  (26, 11, 'EV-2024-018-A', 'Registro de entrada sem correspondente de saida.', 'DIGITAL', '2024-10-12', 'Controle de acesso', 'ARMAZENADA', 1),
  (27, 11, 'EV-2024-018-B', 'Envelope sem identificacao de remetente.', 'DOCUMENTO', '2024-10-13', 'Mesa da vitima', 'ARMAZENADA', 1),
  (28, 12, 'EV-2026-004-A', 'Bilhete com endereco inexistente e horario.', 'DOCUMENTO', DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), 'Bolsa deixada pela vitima', 'EM_ANALISE', 4),
  (29, 12, 'EV-2026-004-B', 'Historico de geolocalizacao do aparelho.', 'DIGITAL', DATE_SUB(CURRENT_DATE(), INTERVAL 45 DAY), 'Copia forense do celular', 'EM_ANALISE', 2),
  (30, 12, 'EV-2026-004-C', 'Material biologico em embalagem de entrega.', 'BIOLOGICA', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), 'Deposito de encomendas', 'EM_ANALISE', 5);

INSERT INTO forensic_analyses (
  analysis_id, evidence_id, analysis_type, analysis_status, is_available,
  requested_on, performed_on, laboratory, result_summary
) VALUES
  (1, 2, 'DNA', 'INCONCLUSIVA', TRUE, '1998-09-02', '1998-10-14', 'Laboratorio Regional Sul', 'Perfil parcial, insuficiente para identificacao na epoca.'),
  (2, 4, 'DOCUMENTAL', 'CONCLUIDA', TRUE, '2001-04-25', '2001-05-10', 'Instituto de Documentoscopia', 'Laminacao e numeracao foram alteradas.'),
  (3, 6, 'IMPRESSAO_DIGITAL', 'INCONCLUSIVA', TRUE, '2001-04-25', '2001-05-22', 'Instituto de Identificacao', 'Apenas oito pontos caracteristicos recuperados.'),
  (4, 7, 'DNA', 'PENDENTE', FALSE, DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), NULL, 'Laboratorio Nacional de Genetica', NULL),
  (5, 10, 'DIGITAL', 'CONCLUIDA', TRUE, DATE_SUB(CURRENT_DATE(), INTERVAL 4 MONTH), DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), 'Nucleo de Pericia Digital', 'Indice recuperado relaciona tres cargas e dois nomes abreviados.'),
  (6, 13, 'DIGITAL', 'INCONCLUSIVA', TRUE, '2004-08-01', '2004-09-12', 'Nucleo de Audio Forense', 'Trecho de voz preservado sem qualidade para reconhecimento.'),
  (7, 16, 'DNA', 'CONCLUIDA', TRUE, '2016-08-09', '2017-11-21', 'Laboratorio Nacional de Genetica', 'Perfil compativel com a suspeita principal.'),
  (8, 20, 'IMPRESSAO_DIGITAL', 'CONCLUIDA', TRUE, '2018-12-18', '2019-01-08', 'Instituto de Identificacao', 'Impressao compativel com o suspeito principal.'),
  (9, 23, 'DNA', 'PENDENTE', FALSE, DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), NULL, 'Laboratorio Nacional de Genetica', NULL),
  (10, 24, 'DIGITAL', 'CONCLUIDA', TRUE, DATE_SUB(CURRENT_DATE(), INTERVAL 5 MONTH), DATE_SUB(CURRENT_DATE(), INTERVAL 4 MONTH), 'Nucleo de Pericia Digital', 'Sequencia de quadros mostra acesso ao corredor tecnico.'),
  (11, 25, 'DIGITAL', 'CONCLUIDA', TRUE, DATE_SUB(CURRENT_DATE(), INTERVAL 4 MONTH), DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH), 'Nucleo de Pericia Digital', 'Software executou exclusao remota no horario investigado.'),
  (12, 30, 'DNA', 'PENDENTE', FALSE, DATE_SUB(CURRENT_DATE(), INTERVAL 25 DAY), NULL, 'Laboratorio Nacional de Genetica', NULL);

INSERT INTO case_status_history (
  status_history_id, case_id, previous_status, new_status, changed_at,
  reason, changed_by_investigator_id
) VALUES
  (1, 1, NULL, 'EM_ANDAMENTO', '1998-08-15 09:00:00', 'Abertura do inquerito.', 1),
  (2, 1, 'EM_ANDAMENTO', 'ARQUIVADO', '2000-03-01 17:30:00', 'Esgotamento das diligencias disponiveis.', 1),
  (3, 2, NULL, 'EM_ANDAMENTO', '2001-04-21 11:00:00', 'Abertura do inquerito.', 3),
  (4, 2, 'EM_ANDAMENTO', 'ARQUIVADO', '2004-01-15 16:00:00', 'Ausencia de prova suficiente para denuncia.', 3),
  (5, 3, NULL, 'EM_ANDAMENTO', '2003-11-03 08:40:00', 'Abertura do inquerito.', 3),
  (6, 3, 'EM_ANDAMENTO', 'ARQUIVADO', '2007-06-20 14:20:00', 'Diligencias encerradas sem localizacao da vitima.', 3),
  (7, 3, 'ARQUIVADO', 'EM_REABERTURA', '2025-04-11 10:15:00', 'Nova tecnica permitiu recuperar indice digital.', 4),
  (8, 4, NULL, 'EM_ANDAMENTO', '2004-07-20 07:50:00', 'Abertura do inquerito.', 1),
  (9, 4, 'EM_ANDAMENTO', 'ARQUIVADO', '2008-02-02 12:00:00', 'Provas tecnicas inconclusivas.', 1),
  (10, 5, NULL, 'EM_ANDAMENTO', '2009-01-30 23:10:00', 'Abertura do inquerito.', 2),
  (11, 6, NULL, 'EM_ANDAMENTO', '2012-05-11 15:00:00', 'Abertura do inquerito.', 3),
  (12, 6, 'EM_ANDAMENTO', 'RESOLVIDO', '2018-02-20 13:30:00', 'DNA e controle de acesso confirmaram a autoria.', 3),
  (13, 7, NULL, 'EM_ANDAMENTO', '2015-09-04 06:00:00', 'Abertura do inquerito.', 4),
  (14, 7, 'EM_ANDAMENTO', 'ARQUIVADO', '2019-09-04 18:00:00', 'Ausencia de localizacao da vitima e de prova conclusiva.', 4),
  (15, 8, NULL, 'EM_ANDAMENTO', '2018-12-17 22:00:00', 'Abertura do inquerito.', 3),
  (16, 8, 'EM_ANDAMENTO', 'RESOLVIDO', '2021-06-10 09:45:00', 'Impressao e log de acesso confirmaram a autoria.', 3),
  (17, 9, NULL, 'EM_ANDAMENTO', '2021-03-22 20:00:00', 'Abertura do inquerito.', 3),
  (18, 10, NULL, 'EM_ANDAMENTO', '2023-06-09 12:00:00', 'Abertura do inquerito.', 2),
  (19, 10, 'EM_ANDAMENTO', 'ARQUIVADO', '2024-06-09 12:00:00', 'Imagens originais indisponiveis.', 2),
  (20, 10, 'ARQUIVADO', 'EM_REABERTURA', '2025-02-04 09:30:00', 'Recuperacao parcial das imagens apagadas.', 2),
  (21, 11, NULL, 'EM_ANDAMENTO', '2024-10-12 19:20:00', 'Abertura do inquerito.', 1),
  (22, 11, 'EM_ANDAMENTO', 'ARQUIVADO', '2025-10-12 17:00:00', 'Sem novos vestigios apos um ano de diligencias.', 1),
  (23, 12, NULL, 'EM_ANDAMENTO', '2026-02-15 18:00:00', 'Abertura do inquerito.', 4);

COMMIT;

