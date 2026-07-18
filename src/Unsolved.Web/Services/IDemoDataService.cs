using Unsolved.Models.Demo;

namespace Unsolved.Services;

/// <summary>
/// Fornece os dados FICTÍCIOS usados na área demonstrativa do sistema.
/// Isolado atrás de interface para, no futuro, ser substituído por uma
/// camada real de acesso a dados (EF Core + SQL Server) sem tocar nas Views.
/// </summary>
public interface IDemoDataService
{
    IReadOnlyList<InvestigationCase> GetCases();
    InvestigationCase? GetCase(int id);
    IReadOnlyList<Person> GetAllPeople();
    IReadOnlyList<Evidence> GetAllEvidence();

    /// <summary>Métricas exibidas no painel (dashboard).</summary>
    DashboardMetrics GetMetrics();
}

/// <summary>Indicadores do painel principal.</summary>
public record DashboardMetrics(
    int TotalCases,
    int OpenCases,
    int SolvedCases,
    int EvidenceItems,
    int PeopleTracked,
    int TeamMembers);
