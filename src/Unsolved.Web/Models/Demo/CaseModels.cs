namespace Unsolved.Models.Demo;

// ---------------------------------------------------------------------------
// Modelos de domínio da ÁREA DEMONSTRATIVA.
// São classes simples (POCOs) que representam o que a plataforma gerenciaria.
// Hoje alimentadas por dados fictícios (DemoDataService); a estrutura já está
// pronta para ser mapeada como tabelas do SQL Server via EF Core no futuro.
// ---------------------------------------------------------------------------

/// <summary>Um caso / investigação.</summary>
public class InvestigationCase
{
    public int Id { get; set; }
    public string CaseNumber { get; set; } = string.Empty;   // ex.: "UNS-2026-014"
    public string Title { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;         // cidade onde ocorreu
    public string Status { get; set; } = CaseStatus.InProgress;  // ver CaseStatus
    public string Priority { get; set; } = "Média";          // Baixa | Média | Alta
    public string LeadInvestigator { get; set; } = string.Empty;
    public int Progress { get; set; }                        // 0-100
    public DateTime OpenedOn { get; set; }
    public DateTime LastUpdate { get; set; }
    public string Summary { get; set; } = string.Empty;

    public List<Person> People { get; set; } = new();
    public List<Evidence> Evidences { get; set; } = new();
    public List<TimelineEvent> Timeline { get; set; } = new();
}

/// <summary>Pessoa relacionada a um caso (suspeito, vítima, testemunha).</summary>
public class Person
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Testemunha";   // Suspeito | Vítima | Testemunha
    public int? Age { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Evidência armazenada em um caso.</summary>
public class Evidence
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;      // ex.: "EV-014-03"
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "Documento";       // Documento | Foto | Físico | Digital
    public string Status { get; set; } = "Registrada";
    public DateTime CollectedOn { get; set; }
    public string CollectedBy { get; set; } = string.Empty;
}

/// <summary>Evento da linha do tempo da investigação.</summary>
public class TimelineEvent
{
    public int Id { get; set; }
    public DateTime When { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Ocorrência";  // Ocorrência | Evidência | Depoimento | Análise
}

/// <summary>
/// Status de caso conforme o enunciado do exercício
/// (arquivado, em reabertura, em andamento, resolvido). Usados também nos filtros.
/// </summary>
public static class CaseStatus
{
    public const string Archived = "Arquivado";
    public const string Reopening = "Em reabertura";
    public const string InProgress = "Em andamento";
    public const string Solved = "Resolvido";

    public static readonly string[] All = { Archived, Reopening, InProgress, Solved };
}
