using Unsolved.Models.Demo;

namespace Unsolved.Services;

/// <summary>
/// Gera um conjunto de dados FICTÍCIOS e coerentes para a área demonstrativa.
/// Nada aqui representa casos, pessoas ou instituições reais.
///
/// ponytail: dados construídos uma vez em memória. Quando existir banco real,
/// troque esta classe por uma que consulte o SQL Server (a interface não muda).
/// </summary>
public class DemoDataService : IDemoDataService
{
    private readonly List<InvestigationCase> _cases;

    public DemoDataService()
    {
        _cases = BuildCases();
    }

    public IReadOnlyList<InvestigationCase> GetCases() => _cases;

    public InvestigationCase? GetCase(int id) => _cases.FirstOrDefault(c => c.Id == id);

    public IReadOnlyList<Person> GetAllPeople() =>
        _cases.SelectMany(c => c.People).ToList();

    public IReadOnlyList<Evidence> GetAllEvidence() =>
        _cases.SelectMany(c => c.Evidences).ToList();

    public DashboardMetrics GetMetrics() => new(
        TotalCases: _cases.Count,
        OpenCases: _cases.Count(c => c.Status is CaseStatus.InProgress or CaseStatus.Reopening),
        SolvedCases: _cases.Count(c => c.Status == CaseStatus.Solved),
        EvidenceItems: _cases.Sum(c => c.Evidences.Count),
        PeopleTracked: _cases.Sum(c => c.People.Count),
        TeamMembers: 12);

    // -----------------------------------------------------------------------
    // Dados fictícios
    // -----------------------------------------------------------------------
    private static List<InvestigationCase> BuildCases()
    {
        // Data base fixa para reprodutibilidade (nada de DateTime.Now aqui).
        var baseDate = new DateTime(2026, 06, 01);

        return new List<InvestigationCase>
        {
            new()
            {
                Id = 1,
                CaseNumber = "UNS-2026-014",
                Title = "Desaparecimento no Porto Velho",
                City = "Porto Velho",
                Status = CaseStatus.InProgress,
                Priority = "Alta",
                LeadInvestigator = "Insp. A. Marques",
                Progress = 62,
                OpenedOn = baseDate.AddDays(-40),
                LastUpdate = baseDate.AddDays(-2),
                Summary = "Registro de desaparecimento com múltiplas testemunhas e evidências digitais em análise.",
                People = new()
                {
                    new() { Id = 101, Name = "Testemunha 01", Type = "Testemunha", Age = 34, Notes = "Relato no cais às 22h." },
                    new() { Id = 102, Name = "Pessoa de Interesse A", Type = "Suspeito", Age = 41, Notes = "Última pessoa vista com a vítima." },
                    new() { Id = 103, Name = "Vítima (registro)", Type = "Vítima", Age = 29 }
                },
                Evidences = new()
                {
                    new() { Id = 201, Code = "EV-014-01", Description = "Registro de câmera do porto", Type = "Digital", Status = "Em análise", CollectedOn = baseDate.AddDays(-38), CollectedBy = "Téc. R. Souza" },
                    new() { Id = 202, Code = "EV-014-02", Description = "Depoimento transcrito", Type = "Documento", Status = "Registrada", CollectedOn = baseDate.AddDays(-37), CollectedBy = "Insp. A. Marques" },
                    new() { Id = 203, Code = "EV-014-03", Description = "Objeto pessoal encontrado", Type = "Físico", Status = "Em custódia", CollectedOn = baseDate.AddDays(-35), CollectedBy = "Téc. R. Souza" }
                },
                Timeline = new()
                {
                    new() { Id = 301, When = baseDate.AddDays(-40), Title = "Abertura do caso", Description = "Registro inicial da ocorrência.", Category = "Ocorrência" },
                    new() { Id = 302, When = baseDate.AddDays(-38), Title = "Coleta de imagens", Description = "Câmeras do porto requisitadas.", Category = "Evidência" },
                    new() { Id = 303, When = baseDate.AddDays(-30), Title = "Depoimento de testemunha", Description = "Testemunha 01 ouvida.", Category = "Depoimento" },
                    new() { Id = 304, When = baseDate.AddDays(-2), Title = "Análise digital", Description = "Cruzamento de horários das imagens.", Category = "Análise" }
                }
            },
            new()
            {
                Id = 2,
                CaseNumber = "UNS-2026-021",
                Title = "Fraude documental corporativa",
                City = "São Paulo",
                Status = CaseStatus.Reopening,
                Priority = "Média",
                LeadInvestigator = "Insp. C. Nogueira",
                Progress = 78,
                OpenedOn = baseDate.AddDays(-58),
                LastUpdate = baseDate.AddDays(-5),
                Summary = "Suspeita de adulteração de documentos internos. Perícia contábil em andamento.",
                People = new()
                {
                    new() { Id = 111, Name = "Pessoa de Interesse B", Type = "Suspeito", Age = 47 },
                    new() { Id = 112, Name = "Testemunha 02", Type = "Testemunha", Age = 38 }
                },
                Evidences = new()
                {
                    new() { Id = 211, Code = "EV-021-01", Description = "Contratos digitalizados", Type = "Documento", Status = "Em análise", CollectedOn = baseDate.AddDays(-55), CollectedBy = "Téc. L. Dias" },
                    new() { Id = 212, Code = "EV-021-02", Description = "Registros de acesso ao sistema", Type = "Digital", Status = "Registrada", CollectedOn = baseDate.AddDays(-50), CollectedBy = "Téc. L. Dias" }
                },
                Timeline = new()
                {
                    new() { Id = 311, When = baseDate.AddDays(-58), Title = "Abertura do caso", Description = "Denúncia interna registrada.", Category = "Ocorrência" },
                    new() { Id = 312, When = baseDate.AddDays(-50), Title = "Coleta de logs", Description = "Registros de acesso preservados.", Category = "Evidência" },
                    new() { Id = 313, When = baseDate.AddDays(-5), Title = "Perícia contábil", Description = "Inconsistências identificadas.", Category = "Análise" }
                }
            },
            new()
            {
                Id = 3,
                CaseNumber = "UNS-2025-198",
                Title = "Furto em galeria de arte",
                City = "Rio de Janeiro",
                Status = CaseStatus.Solved,
                Priority = "Média",
                LeadInvestigator = "Insp. A. Marques",
                Progress = 100,
                OpenedOn = baseDate.AddDays(-210),
                LastUpdate = baseDate.AddDays(-90),
                Summary = "Caso encerrado após recuperação do item e identificação dos responsáveis.",
                People = new()
                {
                    new() { Id = 121, Name = "Responsável identificado", Type = "Suspeito", Age = 33 },
                    new() { Id = 122, Name = "Testemunha 03", Type = "Testemunha", Age = 52 }
                },
                Evidences = new()
                {
                    new() { Id = 221, Code = "EV-198-01", Description = "Laudo pericial do local", Type = "Documento", Status = "Arquivada", CollectedOn = baseDate.AddDays(-208), CollectedBy = "Téc. R. Souza" }
                },
                Timeline = new()
                {
                    new() { Id = 321, When = baseDate.AddDays(-210), Title = "Abertura do caso", Description = "Ocorrência registrada pela galeria.", Category = "Ocorrência" },
                    new() { Id = 322, When = baseDate.AddDays(-120), Title = "Identificação", Description = "Cruzamento de evidências.", Category = "Análise" },
                    new() { Id = 323, When = baseDate.AddDays(-90), Title = "Encerramento", Description = "Item recuperado, caso resolvido.", Category = "Ocorrência" }
                }
            },
            new()
            {
                Id = 4,
                CaseNumber = "UNS-2024-077",
                Title = "Ocorrência sem novos indícios",
                City = "Curitiba",
                Status = CaseStatus.Archived,
                Priority = "Baixa",
                LeadInvestigator = "Insp. C. Nogueira",
                Progress = 35,
                OpenedOn = baseDate.AddDays(-520),
                LastUpdate = baseDate.AddDays(-300),
                Summary = "Investigação sem novos elementos há meses. Mantida em arquivo frio para revisão futura.",
                People = new()
                {
                    new() { Id = 131, Name = "Testemunha 04", Type = "Testemunha", Age = 60 }
                },
                Evidences = new()
                {
                    new() { Id = 231, Code = "EV-077-01", Description = "Anotações de campo", Type = "Documento", Status = "Arquivada", CollectedOn = baseDate.AddDays(-515), CollectedBy = "Insp. C. Nogueira" }
                },
                Timeline = new()
                {
                    new() { Id = 331, When = baseDate.AddDays(-520), Title = "Abertura do caso", Description = "Registro inicial.", Category = "Ocorrência" },
                    new() { Id = 332, When = baseDate.AddDays(-300), Title = "Suspensão temporária", Description = "Sem novos indícios.", Category = "Análise" }
                }
            }
        };
    }
}
