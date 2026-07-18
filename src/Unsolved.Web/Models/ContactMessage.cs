namespace Unsolved.Models;

/// <summary>
/// Representa uma mensagem de contato / solicitação de demonstração recebida.
/// Preparada para virar uma entidade de banco de dados (SQL Server) no futuro:
/// basta adicionar mapeamento com Entity Framework Core.
/// </summary>
public class ContactMessage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? UserRange { get; set; }
    public string? Message { get; set; }

    /// <summary>Origem do envio: "contato" ou "demonstracao".</summary>
    public string Source { get; set; } = "contato";

    public DateTime ReceivedAtUtc { get; set; } = DateTime.UtcNow;
}
