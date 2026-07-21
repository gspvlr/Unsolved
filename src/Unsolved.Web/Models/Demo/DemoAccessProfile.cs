namespace Unsolved.Models.Demo;

/// <summary>
/// Perfis fechados usados somente na demonstração. A lista centralizada mantém
/// a tela de login, os cookies e o endpoint de sessão falando a mesma língua.
/// </summary>
public sealed record DemoAccessProfile(
    string Id,
    string Name,
    string Title,
    string Email,
    string Password,
    string AccessLevel,
    string Description,
    string? AssignedCaseId = null,
    string? AssignedCaseCode = null,
    string? AssignedCaseTitle = null);

public static class DemoAccessCatalog
{
    public static IReadOnlyList<DemoAccessProfile> Profiles { get; } =
    [
        new(
            "admin",
            "A. Marques",
            "Administrador geral",
            "admin@unsolved.demo",
            "admin123",
            "Acesso total",
            "Visualiza e altera todos os casos, usuários, evidências e configurações."),
        new(
            "detective",
            "Rafael Nunes",
            "Detetive responsável",
            "detetive@unsolved.demo",
            "detetive123",
            "Caso atribuído",
            "Visualiza e edita somente a investigação em que está atuando.",
            "c5",
            "UNS-2009-008",
            "Sinal Interrompido"),
        new(
            "viewer",
            "Helena Costa",
            "Usuário de consulta",
            "consulta@unsolved.demo",
            "consulta123",
            "Somente leitura",
            "Consulta os arquivos disponíveis, sem criar, editar ou excluir registros."),
    ];

    public static DemoAccessProfile? Validate(string email, string password) =>
        Profiles.FirstOrDefault(profile =>
            string.Equals(profile.Email, email?.Trim(), StringComparison.OrdinalIgnoreCase) &&
            profile.Password == password);
}
