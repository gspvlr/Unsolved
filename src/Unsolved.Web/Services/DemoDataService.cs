using Unsolved.Models.Demo;

namespace Unsolved.Services;

/// <summary>
/// Dados FICTÍCIOS da área demonstrativa — espelham 1:1 o seed MySQL
/// (database/02_seed.sql): mesmas cidades, investigadores, pessoas, casos,
/// evidências, perícias e histórico. Nada representa fatos reais.
///
/// ponytail: dados montados uma vez em memória. Quando o site ligar no MySQL,
/// troque esta classe por consultas EF Core — a interface não muda.
/// Datas relativas (últimos meses) usam DateTime.Today, como o CURRENT_DATE() do SQL.
/// </summary>
public class DemoDataService : IDemoDataService
{
    private readonly List<City> _cities;
    private readonly List<Investigator> _investigators;
    private readonly List<InvestigationCase> _cases;

    public DemoDataService()
    {
        _cities = BuildCities();
        _investigators = BuildInvestigators();
        _cases = BuildCases(_cities, _investigators);
    }

    public IReadOnlyList<InvestigationCase> GetCases() => _cases;
    public InvestigationCase? GetCase(int id) => _cases.FirstOrDefault(c => c.Id == id);
    public IReadOnlyList<City> GetCities() => _cities;
    public IReadOnlyList<Investigator> GetInvestigators() => _investigators;

    public IReadOnlyList<Evidence> GetAllEvidence() =>
        _cases.SelectMany(c => c.Evidences).OrderBy(e => e.Code).ToList();

    public IReadOnlyList<PersonRoles> GetPeopleWithRoles()
    {
        var map = new Dictionary<int, (Person p, int v, int s, int w)>();
        void Bump(Person p, int v, int s, int w)
        {
            var cur = map.TryGetValue(p.Id, out var e) ? e : (p, 0, 0, 0);
            map[p.Id] = (p, cur.Item2 + v, cur.Item3 + s, cur.Item4 + w);
        }
        foreach (var c in _cases)
        {
            foreach (var x in c.Victims) Bump(x.Person, 1, 0, 0);
            foreach (var x in c.Suspects) Bump(x.Person, 0, 1, 0);
            foreach (var x in c.Witnesses) Bump(x.Person, 0, 0, 1);
        }
        return map.Values
            .Select(t => new PersonRoles(t.p, t.v, t.s, t.w))
            .OrderBy(r => r.Person.FullName)
            .ToList();
    }

    public DashboardMetrics GetMetrics() => new(
        TotalCases: _cases.Count,
        OpenCases: _cases.Count(c => c.Status is CaseStatus.InProgress or CaseStatus.Reopening),
        SolvedCases: _cases.Count(c => c.Status == CaseStatus.Solved),
        EvidenceItems: _cases.Sum(c => c.Evidences.Count),
        PeopleTracked: GetPeopleWithRoles().Count,
        Investigators: _investigators.Count);

    // =======================================================================
    // Construção dos dados (equivalente ao 02_seed.sql)
    // =======================================================================
    private static DateTime D(int y, int m, int d) => new(y, m, d);
    private static DateTime Ago(int months = 0, int days = 0) => DateTime.Today.AddMonths(-months).AddDays(-days);

    private static List<City> BuildCities() => new()
    {
        new() { Id = 1, Name = "São Paulo", State = "SP" },
        new() { Id = 2, Name = "Rio de Janeiro", State = "RJ" },
        new() { Id = 3, Name = "Porto Alegre", State = "RS" },
        new() { Id = 4, Name = "Recife", State = "PE" },
        new() { Id = 5, Name = "Manaus", State = "AM" },
        new() { Id = 6, Name = "Belo Horizonte", State = "MG" },
        new() { Id = 7, Name = "Curitiba", State = "PR" },
        new() { Id = 8, Name = "Salvador", State = "BA" },
    };

    private static List<Investigator> BuildInvestigators() => new()
    {
        new() { Id = 1, FullName = "Marina Duarte", Badge = "INV-1042", Specialty = "Análise comportamental" },
        new() { Id = 2, FullName = "Rafael Nunes", Badge = "INV-1178", Specialty = "Perícia digital" },
        new() { Id = 3, FullName = "Camila Torres", Badge = "INV-0981", Specialty = "Crimes contra a pessoa" },
        new() { Id = 4, FullName = "Diego Martins", Badge = "INV-1255", Specialty = "Inteligência e vínculos" },
        new() { Id = 5, FullName = "Lívia Araújo", Badge = "INV-1310", Specialty = "Genética forense" },
    };

    private static List<InvestigationCase> BuildCases(List<City> cities, List<Investigator> investigators)
    {
        City C(int id) => cities.First(c => c.Id == id);
        Investigator I(int id) => investigators.First(i => i.Id == id);

        // ---- people (tabela people) ----
        var people = new (int Id, string Name, DateTime Birth, string Notes)[]
        {
            (1, "Ana Beatriz Lima", D(1969,5,18), "Vítima principal do caso da estação."),
            (2, "Paulo Henrique Reis", D(1966,2,3), "Comerciante conhecido no centro antigo."),
            (3, "Clara Menezes", D(1977,9,12), "Pesquisadora ligada ao arquivo portuário."),
            (4, "Renato Alves", D(1963,4,28), "Jornalista que investigava contratos públicos."),
            (5, "Joana Silva Prado", D(1981,11,19), "Técnica de telecomunicações."),
            (6, "Eduardo Campos Luz", D(1974,1,7), "Hóspede registrado no quarto 312."),
            (7, "Márcia Oliveira", D(1982,8,22), "Motorista da linha intermunicipal."),
            (8, "Daniel Kato", D(1987,6,30), "Arquiteto e colecionador de chaves antigas."),
            (9, "Sônia Batista", D(1990,3,16), "Pescadora da comunidade local."),
            (10, "Leandro Gomes", D(1992,10,4), "Operador de manutenção predial."),
            (11, "Patrícia Rosa", D(1988,12,9), "Analista administrativa."),
            (12, "Carlos Viana", D(1995,7,25), "Mensageiro autônomo."),
            (13, "Mauro Tavares", D(1968,7,1), "Pessoa de interesse recorrente em casos arquivados."),
            (14, "Lúcia Farias", D(1972,1,17), "Ex-funcionária da administração portuária."),
            (15, "Gilberto Mota", D(1961,10,2), "Antigo intermediário de documentos."),
            (16, "Paula Montenegro", D(1984,5,15), "Técnica com acesso a redes de comunicação."),
            (17, "Vitor Salgado", D(1979,3,21), "Proprietário de empresa de transporte."),
            (18, "Nádia Ferraz", D(1989,11,8), "Consultora com acesso ao prédio investigado."),
            (19, "Bruno Seixas", D(1991,2,14), "Especialista autônomo em dispositivos digitais."),
            (20, "Elias Moura", D(1983,6,6), "Ex-prestador de serviços no porto."),
            (21, "Helena Costa", D(1958,4,9), "Testemunha recorrente em três inquéritos antigos."),
            (22, "Roberto Assis", D(1970,9,18), "Vigia noturno aposentado."),
            (23, "Irene Lopes", D(1985,12,20), "Moradora próxima ao local do crime."),
            (24, "Tiago Freire", D(1993,7,12), "Motorista de aplicativo."),
            (25, "Célia Barros", D(1965,6,24), "Ex-recepcionista de hotel."),
            (26, "Fábio Neves", D(1988,2,11), "Técnico de segurança eletrônica."),
            (27, "Rita Souza", D(1976,8,31), "Comerciante do bairro."),
            (28, "Marcelo Antunes", D(1996,5,29), "Entregador que presenciou movimentação incomum."),
        }.ToDictionary(x => x.Id, x => new Person { Id = x.Id, FullName = x.Name, BirthDate = x.Birth, Notes = x.Notes });
        Person P(int id) => people[id];

        // ---- suspect_profiles (mesclado nos suspeitos) ----
        var profiles = new Dictionary<int, (string History, string Risk)>
        {
            [13] = ("Fraude documental em 1996; investigação por receptação em 2000.", "Usou identidades diferentes e aparece em três casos arquivados."),
            [14] = ("Sem condenações; citada em sindicância administrativa em 2002.", "Conhecia rotinas e acessos do arquivo."),
            [15] = ("Condenação por falsificação de documentos em 1994.", "Pode ter intermediado material retirado do local."),
            [16] = ("Advertência profissional por acesso indevido à rede interna.", "Conhecimento técnico compatível com a interrupção do sinal."),
            [17] = ("Processo por transporte irregular encerrado sem condenação.", "Controlava veículos da rota investigada."),
            [18] = ("Sem antecedentes conhecidos.", "Credencial de acesso registrada no dia do fato."),
            [19] = ("Investigação anterior por clonagem de dispositivos.", "Possui ferramentas compatíveis com os vestígios digitais."),
            [20] = ("Ocorrências por invasão de propriedade em 2019.", "Conhecia os acessos secundários da área portuária."),
        };
        Suspect Susp(int personId, string? alias, int? age, string link, bool primary) => new()
        {
            Person = P(personId),
            Alias = alias,
            AgeWhenLinked = age,
            LinkToCrime = link,
            IsPrimary = primary,
            CriminalHistory = profiles.TryGetValue(personId, out var pr) ? pr.History : null,
            RiskNotes = profiles.TryGetValue(personId, out var pr2) ? pr2.Risk : null,
        };

        // Atalhos de exibição (valores do ENUM já convertidos).
        Victim Vic(int id, int age, string occ, string rel, string prof) =>
            new() { Person = P(id), AgeAtOccurrence = age, Occupation = occ, Relationship = rel, Profile = prof };
        Witness Wit(int id, string contact, string stmt, string rel, DateTime on, int age) =>
            new() { Person = P(id), Contact = contact, Statement = stmt, Reliability = rel, RecordedOn = on, Age = age };
        CaseInvestigator Team(int invId, DateTime from, DateTime? to, bool lead, string notes) =>
            new() { Investigator = I(invId), AssignedOn = from, ReleasedOn = to, IsLead = lead, Notes = notes };
        ForensicAnalysis An(string type, string status, bool avail, DateTime req, DateTime? perf, string lab, string? result) =>
            new() { Type = type, Status = status, Available = avail, RequestedOn = req, PerformedOn = perf, Laboratory = lab, Result = result };
        Evidence Ev(int id, string code, string desc, string type, DateTime disc, string loc, string custody, int collector, params ForensicAnalysis[] an) =>
            new() { Id = id, Code = code, Description = desc, Type = type, DiscoveredOn = disc, FoundLocation = loc, CustodyStatus = custody, CollectedBy = I(collector), Analyses = an.ToList() };

        var cases = new List<InvestigationCase>
        {
            new()
            {
                Id = 1, CaseCode = "UNS-1998-001", Title = "A Mala da Estação",
                CrimeDescription = "Desaparecimento seguido da localização de objetos pessoais em uma mala abandonada na estação central.",
                CrimeOccurredOn = D(1998,8,14), OpenedOn = D(1998,8,15), City = C(3),
                Status = CaseStatus.Archived, Priority = "Alta",
                Victims = { Vic(1, 29, "Fotógrafa", "Pessoa desaparecida e proprietária dos objetos.", "Trabalhava em reportagens urbanas.") },
                Suspects = { Susp(13, "M. Torres", 30, "Assinatura semelhante em recibo encontrado na mala.", true) },
                Witnesses =
                {
                    Wit(21, "Contato preservado no inquérito físico", "Viu um homem retirar etiquetas da mala antes de deixá-la na plataforma.", "Alta", D(1998,8,16), 40),
                    Wit(22, "Contato preservado no inquérito físico", "Relatou falha de iluminação e um veículo escuro na saída lateral.", "Média", D(1998,8,16), 27),
                },
                Team =
                {
                    Team(1, D(1998,8,15), D(2000,3,1), true, "Coordenação inicial do caso."),
                    Team(4, D(2025,9,1), null, false, "Revisão de vínculos históricos."),
                },
                Evidences =
                {
                    Ev(1, "EV-1998-001-A", "Mala de couro com etiqueta parcialmente removida.", "Física", D(1998,8,14), "Plataforma 4 da estação central", "Armazenada", 1),
                    Ev(2, "EV-1998-001-B", "Fios de cabelo preservados no forro interno.", "Biológica", D(1998,8,15), "Interior da mala", "Em análise", 1,
                        An("DNA", "Inconclusiva", true, D(1998,9,2), D(1998,10,14), "Laboratório Regional Sul", "Perfil parcial, insuficiente para identificação na época.")),
                    Ev(3, "EV-1998-001-C", "Recibo com assinatura abreviada.", "Documento", D(1998,8,15), "Bolso lateral da mala", "Armazenada", 1),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(1998,8,15).AddHours(9), Reason = "Abertura do inquérito.", By = I(1) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2000,3,1).AddHours(17.5), Reason = "Esgotamento das diligências disponíveis.", By = I(1) },
                },
            },
            new()
            {
                Id = 2, CaseCode = "UNS-2001-014", Title = "Ecos do Viaduto",
                CrimeDescription = "Homicídio sem autoria definida ocorrido sob um viaduto, com documentos possivelmente adulterados.",
                CrimeOccurredOn = D(2001,4,21), OpenedOn = D(2001,4,21), City = C(1),
                Status = CaseStatus.Archived, Priority = "Crítica",
                Victims = { Vic(2, 35, "Comerciante", "Vítima fatal localizada no local.", "Mantinha comércio no centro e fazia cobranças externas.") },
                Suspects =
                {
                    Susp(13, "Marcos", 33, "Documento adulterado ligado ao local do crime.", true),
                    Susp(15, "Giba", 40, "Intermediou a impressão de documentos falsos.", false),
                },
                Witnesses =
                {
                    Wit(21, "Contato preservado no inquérito físico", "Reconheceu o mesmo homem da estação circulando perto do viaduto.", "Alta", D(2001,4,22), 43),
                    Wit(23, "Contato atualizado sob sigilo", "Ouviu discussão e identificou referência a documentos.", "Média", D(2001,4,22), 15),
                },
                Team =
                {
                    Team(3, D(2001,4,21), D(2004,1,15), true, "Condução original."),
                    Team(4, D(2025,9,1), null, false, "Análise de suspeito recorrente."),
                },
                Evidences =
                {
                    Ev(4, "EV-2001-014-A", "Documento de identidade com sinais de adulteração.", "Documento", D(2001,4,21), "Próximo à vítima", "Armazenada", 3,
                        An("Documental", "Concluída", true, D(2001,4,25), D(2001,5,10), "Instituto de Documentoscopia", "Laminação e numeração foram alteradas.")),
                    Ev(5, "EV-2001-014-B", "Fotografia rasgada de encontro anterior.", "Foto", D(2001,4,21), "Bolso do casaco", "Armazenada", 3),
                    Ev(6, "EV-2001-014-C", "Impressão parcial em superfície metálica.", "Física", D(2001,4,22), "Pilar norte do viaduto", "Em análise", 3,
                        An("Impressão digital", "Inconclusiva", true, D(2001,4,25), D(2001,5,22), "Instituto de Identificação", "Apenas oito pontos característicos recuperados.")),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2001,4,21).AddHours(11), Reason = "Abertura do inquérito.", By = I(3) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2004,1,15).AddHours(16), Reason = "Ausência de prova suficiente para denúncia.", By = I(3) },
                },
            },
            new()
            {
                Id = 3, CaseCode = "UNS-2003-022", Title = "Arquivo do Porto",
                CrimeDescription = "Desaparecimento de pesquisadora e retirada irregular de caixas do arquivo portuário.",
                CrimeOccurredOn = D(2003,11,2), OpenedOn = D(2003,11,3), City = C(4),
                Status = CaseStatus.Reopening, Priority = "Crítica",
                Victims = { Vic(3, 26, "Pesquisadora", "Pessoa desaparecida durante pesquisa documental.", "Estudava registros de cargas antigas.") },
                Suspects =
                {
                    Susp(14, "Lu Farias", 31, "Tinha acesso ao arquivo e foi a última a registrar a vítima.", true),
                    Susp(15, "Giba", 42, "Contato telefônico com funcionária na noite do fato.", false),
                },
                Witnesses =
                {
                    Wit(22, "Contato atualizado sob sigilo", "Viu caixas saindo por uma porta secundária do arquivo.", "Alta", D(2003,11,4), 33),
                    Wit(27, "Contato atualizado sob sigilo", "Recebeu pedido incomum para guardar um pacote.", "Média", D(2003,11,5), 27),
                },
                Team =
                {
                    Team(3, D(2003,11,3), D(2007,6,20), true, "Condução original."),
                    Team(4, D(2025,4,11), null, true, "Reabertura e cruzamento de dados."),
                    Team(5, D(2025,4,11), null, false, "Revisão genética."),
                },
                Evidences =
                {
                    Ev(7, "EV-2003-022-A", "Tecido com material biológico não identificado.", "Biológica", D(2003,11,3), "Porta secundária do arquivo", "Em análise", 3,
                        An("DNA", "Pendente", false, Ago(months: 3), null, "Laboratório Nacional de Genética", null)),
                    Ev(8, "EV-2003-022-B", "Livro de registros com páginas removidas.", "Documento", D(2003,11,3), "Sala de catalogação", "Armazenada", 3),
                    Ev(9, "EV-2003-022-C", "Fita de câmera analógica recuperada.", "Foto", D(2003,11,4), "Guarita do porto", "Em análise", 3),
                    Ev(10, "EV-2003-022-D", "Disquete com índice de cargas.", "Digital", D(2003,11,4), "Mesa da pesquisadora", "Em análise", 2,
                        An("Digital", "Concluída", true, Ago(months: 4), Ago(months: 2), "Núcleo de Perícia Digital", "Índice recuperado relaciona três cargas e dois nomes abreviados.")),
                    Ev(11, "EV-2003-022-E", "Lacre metálico com numeração divergente.", "Física", D(2003,11,5), "Depósito 2", "Armazenada", 4),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2003,11,3).AddHours(8.67), Reason = "Abertura do inquérito.", By = I(3) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2007,6,20).AddHours(14.33), Reason = "Diligências encerradas sem localização da vítima.", By = I(3) },
                    new() { PreviousStatus = CaseStatus.Archived, NewStatus = CaseStatus.Reopening, ChangedAt = D(2025,4,11).AddHours(10.25), Reason = "Nova técnica permitiu recuperar índice digital.", By = I(4) },
                },
            },
            new()
            {
                Id = 4, CaseCode = "UNS-2004-031", Title = "Noite no Catete",
                CrimeDescription = "Morte de jornalista após encontro não identificado; gravações originais não foram localizadas.",
                CrimeOccurredOn = D(2004,7,19), OpenedOn = D(2004,7,20), City = C(2),
                Status = CaseStatus.Archived, Priority = "Alta",
                Victims = { Vic(4, 41, "Jornalista", "Vítima fatal e autor de anotações apreendidas.", "Investigava contratos e empresas de fachada.") },
                Suspects = { Susp(13, "M. Torres", 36, "Número associado a ele aparece nas anotações da vítima.", false) },
                Witnesses =
                {
                    Wit(21, "Contato preservado no inquérito físico", "Viu um homem semelhante ao suspeito saindo do prédio.", "Alta", D(2004,7,20), 46),
                    Wit(25, "Contato atualizado sob sigilo", "Confirmou que a vítima esperava uma visita sem registro.", "Alta", D(2004,7,20), 39),
                },
                Team = { Team(1, D(2004,7,20), D(2008,2,2), true, "Análise de motivação.") },
                Evidences =
                {
                    Ev(12, "EV-2004-031-A", "Caderno com telefones e iniciais.", "Documento", D(2004,7,19), "Apartamento da vítima", "Armazenada", 1),
                    Ev(13, "EV-2004-031-B", "Fita de áudio com trecho danificado.", "Digital", D(2004,7,20), "Gravador da vítima", "Em análise", 1,
                        An("Digital", "Inconclusiva", true, D(2004,8,1), D(2004,9,12), "Núcleo de Áudio Forense", "Trecho de voz preservado sem qualidade para reconhecimento.")),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2004,7,20).AddHours(7.83), Reason = "Abertura do inquérito.", By = I(1) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2008,2,2).AddHours(12), Reason = "Provas técnicas inconclusivas.", By = I(1) },
                },
            },
            new()
            {
                Id = 5, CaseCode = "UNS-2009-008", Title = "Sinal Interrompido",
                CrimeDescription = "Desaparecimento durante pane simultânea em antenas e câmeras de uma central de telecomunicações.",
                CrimeOccurredOn = D(2009,1,30), OpenedOn = D(2009,1,30), City = C(5),
                Status = CaseStatus.InProgress, Priority = "Alta",
                Victims = { Vic(5, 27, "Técnica de telecomunicações", "Pessoa desaparecida durante o turno.", "Tinha acesso aos equipamentos de sinal.") },
                Suspects = { Susp(16, "P. Monte", 25, "Credencial usada durante a pane simultânea.", true) },
                Witnesses = { Wit(26, "Contato atualizado sob sigilo", "Detectou comandos manuais antes da pane geral.", "Alta", D(2009,1,31), 20) },
                Team =
                {
                    Team(2, D(2009,1,30), null, true, "Investigação de falha digital."),
                    Team(4, D(2025,1,10), null, false, "Correlação com credenciais."),
                },
                Evidences =
                {
                    Ev(14, "EV-2009-008-A", "Registro de comandos executados localmente.", "Digital", D(2009,1,30), "Servidor da central", "Em análise", 2),
                    Ev(15, "EV-2009-008-B", "Crachá usado durante a interrupção.", "Física", D(2009,1,31), "Sala de antenas", "Armazenada", 2),
                },
                History = { new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2009,1,30).AddHours(23.17), Reason = "Abertura do inquérito.", By = I(2) } },
            },
            new()
            {
                Id = 6, CaseCode = "UNS-2012-019", Title = "Quarto 312",
                CrimeDescription = "Homicídio em hotel esclarecido após confronto de registros de acesso e perfil genético.",
                CrimeOccurredOn = D(2012,5,11), OpenedOn = D(2012,5,11), ClosedOn = D(2018,2,20), City = C(6),
                Status = CaseStatus.Solved, Priority = "Média",
                Victims = { Vic(6, 38, "Representante comercial", "Vítima fatal no quarto 312.", "Viajava semanalmente pela região.") },
                Suspects = { Susp(18, "N. Ferraz", 22, "Registro de acesso e DNA vincularam a suspeita ao quarto.", true) },
                Witnesses = { Wit(25, "Contato atualizado sob sigilo", "Viu a suspeita usar o elevador de serviço.", "Alta", D(2012,5,12), 46) },
                Team =
                {
                    Team(3, D(2012,5,11), D(2018,2,20), true, "Coordenação do caso resolvido."),
                    Team(5, D(2016,8,9), D(2018,2,20), false, "Análise de DNA."),
                },
                Evidences =
                {
                    Ev(16, "EV-2012-019-A", "Amostra biológica coletada no quarto.", "Biológica", D(2012,5,11), "Quarto 312", "Armazenada", 3,
                        An("DNA", "Concluída", true, D(2016,8,9), D(2017,11,21), "Laboratório Nacional de Genética", "Perfil compatível com a suspeita principal.")),
                    Ev(17, "EV-2012-019-B", "Histórico do cartão de acesso.", "Digital", D(2012,5,12), "Servidor do hotel", "Armazenada", 3),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2012,5,11).AddHours(15), Reason = "Abertura do inquérito.", By = I(3) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Solved, ChangedAt = D(2018,2,20).AddHours(13.5), Reason = "DNA e controle de acesso confirmaram a autoria.", By = I(3) },
                },
            },
            new()
            {
                Id = 7, CaseCode = "UNS-2015-027", Title = "Rota 17",
                CrimeDescription = "Desaparecimento de motorista durante trajeto alterado sem autorização.",
                CrimeOccurredOn = D(2015,9,3), OpenedOn = D(2015,9,4), City = C(1),
                Status = CaseStatus.Archived, Priority = "Alta",
                Victims = { Vic(7, 33, "Motorista", "Pessoa desaparecida durante o trajeto.", "Conhecia rotas alternativas da empresa.") },
                Suspects =
                {
                    Susp(13, "Marcos", 47, "Pagamento feito a motorista pouco antes do desvio.", true),
                    Susp(17, "V. Salgado", 36, "Controlava a frota e alterou os registros da rota.", false),
                },
                Witnesses = { Wit(24, "Contato atualizado sob sigilo", "Seguiu o ônibus por parte do desvio e anotou a placa de apoio.", "Média", D(2015,9,4), 22) },
                Team = { Team(4, D(2015,9,4), D(2019,9,4), true, "Análise da rota e pagamentos.") },
                Evidences =
                {
                    Ev(18, "EV-2015-027-A", "Registro de GPS parcialmente apagado.", "Digital", D(2015,9,4), "Garagem da empresa", "Armazenada", 4),
                    Ev(19, "EV-2015-027-B", "Comprovante de pagamento em espécie.", "Documento", D(2015,9,5), "Armário do motorista", "Armazenada", 4),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2015,9,4).AddHours(6), Reason = "Abertura do inquérito.", By = I(4) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2019,9,4).AddHours(18), Reason = "Ausência de localização da vítima e de prova conclusiva.", By = I(4) },
                },
            },
            new()
            {
                Id = 8, CaseCode = "UNS-2018-042", Title = "A Chave Azul",
                CrimeDescription = "Invasão seguida de homicídio solucionada por impressão digital e registro de chave codificada.",
                CrimeOccurredOn = D(2018,12,17), OpenedOn = D(2018,12,17), ClosedOn = D(2021,6,10), City = C(7),
                Status = CaseStatus.Solved, Priority = "Média",
                Victims = { Vic(8, 31, "Arquiteto", "Vítima fatal no imóvel invadido.", "Colecionava fechaduras e chaves raras.") },
                Suspects = { Susp(19, "B. Six", 27, "Impressão digital e ferramenta localizada na cena.", true) },
                Witnesses = { Wit(26, "Contato atualizado sob sigilo", "Recuperou o registro da fechadura antes da substituição.", "Alta", D(2018,12,18), 30) },
                Team =
                {
                    Team(3, D(2018,12,17), D(2021,6,10), true, "Coordenação do caso resolvido."),
                    Team(2, D(2018,12,18), D(2021,6,10), false, "Recuperação de acesso digital."),
                },
                Evidences =
                {
                    Ev(20, "EV-2018-042-A", "Impressão digital em chave codificada.", "Física", D(2018,12,17), "Escritório da vítima", "Armazenada", 3,
                        An("Impressão digital", "Concluída", true, D(2018,12,18), D(2019,1,8), "Instituto de Identificação", "Impressão compatível com o suspeito principal.")),
                    Ev(21, "EV-2018-042-B", "Log da fechadura eletrônica.", "Digital", D(2018,12,18), "Controlador da porta", "Armazenada", 2),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2018,12,17).AddHours(22), Reason = "Abertura do inquérito.", By = I(3) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Solved, ChangedAt = D(2021,6,10).AddHours(9.75), Reason = "Impressão e log de acesso confirmaram a autoria.", By = I(3) },
                },
            },
            new()
            {
                Id = 9, CaseCode = "UNS-2021-011", Title = "Maré Baixa",
                CrimeDescription = "Desaparecimento de pescadora após embarcação retornar sem tripulação.",
                CrimeOccurredOn = D(2021,3,22), OpenedOn = D(2021,3,22), City = C(8),
                Status = CaseStatus.InProgress, Priority = "Alta",
                Victims = { Vic(9, 31, "Pescadora", "Pessoa desaparecida da embarcação.", "Experiente e conhecia a costa local.") },
                Suspects = { Susp(20, "E. Moura", 37, "Foi visto próximo ao cais e conhecia os acessos.", true) },
                Witnesses = { Wit(27, "Contato atualizado sob sigilo", "Viu uma segunda embarcação sem luzes perto do cais.", "Média", D(2021,3,23), 44) },
                Team = { Team(3, D(2021,3,22), null, true, "Investigação em campo.") },
                Evidences =
                {
                    Ev(22, "EV-2021-011-A", "Colete com fibras de embarcação diferente.", "Física", D(2021,3,23), "Convés da embarcação", "Em análise", 3),
                    Ev(23, "EV-2021-011-B", "Amostra biológica no corrimão.", "Biológica", D(2021,3,23), "Popa da embarcação", "Em análise", 5,
                        An("DNA", "Pendente", false, Ago(months: 2), null, "Laboratório Nacional de Genética", null)),
                },
                History = { new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2021,3,22).AddHours(20), Reason = "Abertura do inquérito.", By = I(3) } },
            },
            new()
            {
                Id = 10, CaseCode = "UNS-2023-006", Title = "Linha de Cinza",
                CrimeDescription = "Morte suspeita em prédio comercial reaberta após recuperação de imagens apagadas.",
                CrimeOccurredOn = D(2023,6,9), OpenedOn = D(2023,6,9), City = C(2),
                Status = CaseStatus.Reopening, Priority = "Crítica",
                Victims = { Vic(10, 30, "Operador de manutenção", "Vítima fatal no prédio comercial.", "Responsável por acessos técnicos.") },
                Suspects = { Susp(19, "B. Six", 32, "Software encontrado no notebook recuperado.", true) },
                Witnesses = { Wit(26, "Contato atualizado sob sigilo", "Confirmou exclusão remota das imagens na madrugada.", "Alta", D(2023,6,10), 35) },
                Team =
                {
                    Team(2, D(2025,2,4), null, true, "Recuperação de imagens."),
                    Team(1, D(2025,2,4), null, false, "Reavaliação de depoimentos."),
                },
                Evidences =
                {
                    Ev(24, "EV-2023-006-A", "Imagens de câmera parcialmente recuperadas.", "Digital", Ago(months: 5), "Servidor do prédio", "Em análise", 2,
                        An("Digital", "Concluída", true, Ago(months: 5), Ago(months: 4), "Núcleo de Perícia Digital", "Sequência de quadros mostra acesso ao corredor técnico.")),
                    Ev(25, "EV-2023-006-B", "Notebook com software de exclusão remota.", "Digital", Ago(months: 4), "Armário técnico", "Em análise", 2,
                        An("Digital", "Concluída", true, Ago(months: 4), Ago(months: 3), "Núcleo de Perícia Digital", "Software executou exclusão remota no horário investigado.")),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2023,6,9).AddHours(12), Reason = "Abertura do inquérito.", By = I(2) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2024,6,9).AddHours(12), Reason = "Imagens originais indisponíveis.", By = I(2) },
                    new() { PreviousStatus = CaseStatus.Archived, NewStatus = CaseStatus.Reopening, ChangedAt = D(2025,2,4).AddHours(9.5), Reason = "Recuperação parcial das imagens apagadas.", By = I(2) },
                },
            },
            new()
            {
                Id = 11, CaseCode = "UNS-2024-018", Title = "Sala Sem Janela",
                CrimeDescription = "Desaparecimento em escritório com acesso controlado e sem registro de saída.",
                CrimeOccurredOn = D(2024,10,12), OpenedOn = D(2024,10,12), City = C(1),
                Status = CaseStatus.Archived, Priority = "Alta",
                Victims = { Vic(11, 35, "Analista administrativa", "Pessoa desaparecida no escritório.", "Trabalhava com contratos internos.") },
                Suspects = { Susp(18, "Nadia M.", 35, "Credencial temporária registrada sem justificativa.", true) },
                Witnesses = { Wit(28, "Contato atualizado sob sigilo", "Entregou um pacote na recepção e viu a vítima entrar na sala.", "Alta", D(2024,10,13), 28) },
                Team = { Team(1, D(2024,10,12), D(2025,10,12), true, "Condução até o arquivamento.") },
                Evidences =
                {
                    Ev(26, "EV-2024-018-A", "Registro de entrada sem correspondente de saída.", "Digital", D(2024,10,12), "Controle de acesso", "Armazenada", 1),
                    Ev(27, "EV-2024-018-B", "Envelope sem identificação de remetente.", "Documento", D(2024,10,13), "Mesa da vítima", "Armazenada", 1),
                },
                History =
                {
                    new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2024,10,12).AddHours(19.33), Reason = "Abertura do inquérito.", By = I(1) },
                    new() { PreviousStatus = CaseStatus.InProgress, NewStatus = CaseStatus.Archived, ChangedAt = D(2025,10,12).AddHours(17), Reason = "Sem novos vestígios após um ano de diligências.", By = I(1) },
                },
            },
            new()
            {
                Id = 12, CaseCode = "UNS-2026-004", Title = "Último Bilhete",
                CrimeDescription = "Mensageiro desaparecido após registrar uma entrega sem destinatário confirmado.",
                CrimeOccurredOn = D(2026,2,15), OpenedOn = D(2026,2,15), City = C(4),
                Status = CaseStatus.InProgress, Priority = "Crítica",
                Victims = { Vic(12, 30, "Mensageiro", "Pessoa desaparecida após uma entrega.", "Atendia rotas sob demanda por aplicativo.") },
                Suspects = { Susp(20, "Elias M.", 42, "Recebeu mensagem do aparelho da vítima.", true) },
                Witnesses = { Wit(28, "Contato atualizado sob sigilo", "Recebeu rota semelhante e percebeu endereço inexistente.", "Alta", D(2026,2,16), 29) },
                Team =
                {
                    Team(4, D(2026,2,15), null, true, "Mapeamento de contatos e rota."),
                    Team(2, D(2026,2,15), null, false, "Análise do aplicativo e aparelho."),
                },
                Evidences =
                {
                    Ev(28, "EV-2026-004-A", "Bilhete com endereço inexistente e horário.", "Documento", Ago(months: 2), "Bolsa deixada pela vítima", "Em análise", 4),
                    Ev(29, "EV-2026-004-B", "Histórico de geolocalização do aparelho.", "Digital", Ago(days: 45), "Cópia forense do celular", "Em análise", 2),
                    Ev(30, "EV-2026-004-C", "Material biológico em embalagem de entrega.", "Biológica", Ago(days: 30), "Depósito de encomendas", "Em análise", 5,
                        An("DNA", "Pendente", false, Ago(days: 25), null, "Laboratório Nacional de Genética", null)),
                },
                History = { new() { PreviousStatus = null, NewStatus = CaseStatus.InProgress, ChangedAt = D(2026,2,15).AddHours(18), Reason = "Abertura do inquérito.", By = I(4) } },
            },
        };

        // Preenche a referência do caso em cada evidência (equivale à FK case_id).
        foreach (var c in cases)
            foreach (var e in c.Evidences)
            {
                e.CaseId = c.Id;
                e.CaseCode = c.CaseCode;
            }

        return cases;
    }
}
