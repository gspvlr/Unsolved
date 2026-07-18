namespace Unsolved.Models;

/// <summary>Dados exibidos na página de erro genérica.</summary>
public class ErrorViewModel
{
    public string? RequestId { get; set; }
    public int StatusCode { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
