using System.Collections.Concurrent;
using Unsolved.Models;

namespace Unsolved.Services;

/// <summary>
/// Implementação simples do serviço de contato: guarda as mensagens em memória
/// e escreve uma linha no log. Suficiente para a demonstração.
///
/// ponytail: armazenamento em memória — troque por SQL Server quando houver
/// necessidade real de persistência. O contrato (IContactService) não muda.
/// </summary>
public class ContactService : IContactService
{
    private readonly ConcurrentBag<ContactMessage> _messages = new();
    private readonly ILogger<ContactService> _logger;
    private int _sequence;

    public ContactService(ILogger<ContactService> logger) => _logger = logger;

    public int Count => _messages.Count;

    public Task<string> SaveAsync(ContactMessage message)
    {
        message.Id = Interlocked.Increment(ref _sequence);
        message.ReceivedAtUtc = DateTime.UtcNow;
        _messages.Add(message);

        // Protocolo no estilo "número de caso": UNS-YYYY-000123
        var protocol = $"UNS-{message.ReceivedAtUtc:yyyy}-{message.Id:000000}";

        _logger.LogInformation(
            "Nova mensagem ({Source}) de {Name} <{Email}> — protocolo {Protocol}",
            message.Source, message.Name, message.Email, protocol);

        return Task.FromResult(protocol);
    }
}
