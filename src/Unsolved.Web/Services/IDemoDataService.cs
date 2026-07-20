using Unsolved.Models.Demo;

namespace Unsolved.Services;

/// <summary>
/// Fornece os dados FICTÍCIOS da área demonstrativa — idênticos ao seed
/// MySQL (database/02_seed.sql). Isolado atrás de interface para, no futuro,
/// ser substituído por uma camada real (EF Core + MySQL) sem tocar nas Views.
/// </summary>
public interface IDemoDataService
{
    IReadOnlyList<InvestigationCase> GetCases();
    InvestigationCase? GetCase(int id);
    IReadOnlyList<City> GetCities();
    IReadOnlyList<Investigator> GetInvestigators();

    /// <summary>Todas as pessoas (people) e o(s) papel(is) que ocupam nos casos.</summary>
    IReadOnlyList<PersonRoles> GetPeopleWithRoles();

    /// <summary>Todas as evidências (com o caso e as análises periciais).</summary>
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
    int Investigators);

/// <summary>Uma pessoa e em quantos casos aparece como vítima/suspeito/testemunha.</summary>
public record PersonRoles(
    Person Person,
    int AsVictim,
    int AsSuspect,
    int AsWitness)
{
    public IEnumerable<string> Roles
    {
        get
        {
            if (AsVictim > 0) yield return "Vítima";
            if (AsSuspect > 0) yield return "Suspeito";
            if (AsWitness > 0) yield return "Testemunha";
        }
    }
    public int CaseAppearances => AsVictim + AsSuspect + AsWitness;
}
