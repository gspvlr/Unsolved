using Unsolved.Models;

namespace Unsolved.Services;

/// <summary>
/// Contrato para persistência de mensagens de contato.
/// Implementação atual: em memória + log (ContactService).
/// Implementação futura: gravar no SQL Server sem alterar os controllers.
/// </summary>
public interface IContactService
{
    /// <summary>Registra a mensagem e devolve o protocolo gerado.</summary>
    Task<string> SaveAsync(ContactMessage message);

    /// <summary>Total de mensagens já recebidas (uso interno/diagnóstico).</summary>
    int Count { get; }
}
