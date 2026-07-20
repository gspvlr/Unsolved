namespace Unsolved.Models.Demo;

// ---------------------------------------------------------------------------
// Modelos da ÁREA DEMONSTRATIVA — espelham o schema MySQL (database/01_schema.sql).
// Os valores já vêm em PT-BR (o ENUM do banco é convertido para exibição).
// Hoje alimentados por dados fictícios idênticos ao seed (database/02_seed.sql);
// prontos para virar consultas EF Core + MySQL.
// ---------------------------------------------------------------------------

/// <summary>Tabela cities.</summary>
public class City
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Display => $"{Name}/{State}";
}

/// <summary>Tabela investigators.</summary>
public class Investigator
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public string Specialty { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
}

/// <summary>Tabela people (identidade reutilizada nos papéis).</summary>
public class Person
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Tabela case_victims.</summary>
public class Victim
{
    public Person Person { get; set; } = new();
    public int? AgeAtOccurrence { get; set; }
    public string? Occupation { get; set; }
    public string Relationship { get; set; } = string.Empty;
    public string? Profile { get; set; }
}

/// <summary>case_suspects + suspect_profiles (mesclados por pessoa).</summary>
public class Suspect
{
    public Person Person { get; set; } = new();
    public string? Alias { get; set; }
    public int? AgeWhenLinked { get; set; }
    public string LinkToCrime { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string? CriminalHistory { get; set; }
    public string? RiskNotes { get; set; }
}

/// <summary>Tabela case_witnesses.</summary>
public class Witness
{
    public Person Person { get; set; } = new();
    public string? Contact { get; set; }
    public string Statement { get; set; } = string.Empty;
    public string Reliability { get; set; } = "Média"; // Baixa | Média | Alta
    public DateTime RecordedOn { get; set; }
    public int? Age { get; set; }
}

/// <summary>Tabela case_investigators (atribuição de um investigador ao caso).</summary>
public class CaseInvestigator
{
    public Investigator Investigator { get; set; } = new();
    public DateTime AssignedOn { get; set; }
    public DateTime? ReleasedOn { get; set; }
    public bool IsLead { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Tabela forensic_analyses.</summary>
public class ForensicAnalysis
{
    public string Type { get; set; } = string.Empty;      // DNA | Balística | Impressão digital | Digital | Documental | Outra
    public string Status { get; set; } = "Pendente";      // Pendente | Concluída | Inconclusiva
    public bool Available { get; set; }
    public DateTime RequestedOn { get; set; }
    public DateTime? PerformedOn { get; set; }
    public string? Laboratory { get; set; }
    public string? Result { get; set; }
}

/// <summary>Tabela evidence (+ análises periciais relacionadas).</summary>
public class Evidence
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;       // Documento | Foto | Física | Digital | Biológica | Outra
    public DateTime DiscoveredOn { get; set; }
    public string FoundLocation { get; set; } = string.Empty;
    public string CustodyStatus { get; set; } = "Catalogada";
    public Investigator? CollectedBy { get; set; }
    public List<ForensicAnalysis> Analyses { get; set; } = new();

    // Referência ao caso (útil na listagem geral de evidências).
    public int CaseId { get; set; }
    public string CaseCode { get; set; } = string.Empty;

    public bool HasDna => Analyses.Any(a => a.Type == "DNA");

    /// <summary>Foto (SVG) da evidência em wwwroot/images/evidence/{Code}.svg.</summary>
    public string ImagePath => $"/images/evidence/{Code}.svg";
}

/// <summary>Tabela case_status_history.</summary>
public class StatusChange
{
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Investigator? By { get; set; }
}

/// <summary>Tabela cases + coleções relacionadas.</summary>
public class InvestigationCase
{
    public int Id { get; set; }
    public string CaseCode { get; set; } = string.Empty;   // ex.: "UNS-1998-001"
    public string Title { get; set; } = string.Empty;
    public string CrimeDescription { get; set; } = string.Empty;
    public DateTime CrimeOccurredOn { get; set; }
    public DateTime OpenedOn { get; set; }
    public DateTime? ClosedOn { get; set; }
    public City City { get; set; } = new();
    public string Status { get; set; } = CaseStatus.InProgress;
    public string Priority { get; set; } = "Média";        // Baixa | Média | Alta | Crítica

    public List<Victim> Victims { get; set; } = new();
    public List<Suspect> Suspects { get; set; } = new();
    public List<Witness> Witnesses { get; set; } = new();
    public List<CaseInvestigator> Team { get; set; } = new();
    public List<Evidence> Evidences { get; set; } = new();
    public List<StatusChange> History { get; set; } = new();

    /// <summary>Investigador responsável (is_lead ativo; senão o primeiro).</summary>
    public Investigator? Lead =>
        Team.FirstOrDefault(t => t.IsLead && t.ReleasedOn == null)?.Investigator
        ?? Team.FirstOrDefault(t => t.IsLead)?.Investigator
        ?? Team.FirstOrDefault()?.Investigator;

    /// <summary>Foto de capa do caso: prioriza uma evidência do tipo "Foto".</summary>
    public string? CoverImage =>
        (Evidences.FirstOrDefault(e => e.Type == "Foto")
         ?? Evidences.FirstOrDefault(e => e.Type is "Física" or "Biológica")
         ?? Evidences.FirstOrDefault())?.ImagePath;

    /// <summary>Progresso ilustrativo derivado do status (o banco não guarda %).</summary>
    public int Progress => Status switch
    {
        CaseStatus.Solved => 100,
        CaseStatus.InProgress => 65,
        CaseStatus.Reopening => 45,
        _ => 25 // Arquivado
    };
}

/// <summary>
/// Status do caso — ENUM ARQUIVADO/EM_REABERTURA/EM_ANDAMENTO/RESOLVIDO.
/// Valores em PT-BR usados na exibição e nos filtros.
/// </summary>
public static class CaseStatus
{
    public const string Archived = "Arquivado";
    public const string Reopening = "Em reabertura";
    public const string InProgress = "Em andamento";
    public const string Solved = "Resolvido";

    public static readonly string[] All = { Archived, Reopening, InProgress, Solved };

    /// <summary>Converte o valor do ENUM do MySQL para exibição.</summary>
    public static string FromDb(string value) => value switch
    {
        "ARQUIVADO" => Archived,
        "EM_REABERTURA" => Reopening,
        "EM_ANDAMENTO" => InProgress,
        "RESOLVIDO" => Solved,
        _ => value
    };
}
