using System.ComponentModel.DataAnnotations;

namespace Unsolved.ViewModels;

/// <summary>
/// Dados do formulário de contato / solicitação de demonstração.
/// As anotações abaixo geram a validação no SERVIDOR (C#). A validação no
/// cliente (JavaScript) espelha essas mesmas regras em wwwroot/js/validation.js.
/// </summary>
public class ContactViewModel
{
    [Required(ErrorMessage = "Informe seu nome.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 120 caracteres.")]
    [Display(Name = "Nome")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe a instituição ou empresa.")]
    [StringLength(160, ErrorMessage = "Máximo de 160 caracteres.")]
    [Display(Name = "Instituição ou empresa")]
    public string Organization { get; set; } = string.Empty;

    [StringLength(120, ErrorMessage = "Máximo de 120 caracteres.")]
    [Display(Name = "Cargo")]
    public string? Role { get; set; }

    [Required(ErrorMessage = "Informe um e-mail profissional.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [StringLength(160, ErrorMessage = "Máximo de 160 caracteres.")]
    [Display(Name = "E-mail profissional")]
    public string Email { get; set; } = string.Empty;

    // Aceita formatos comuns de telefone brasileiro (com ou sem máscara).
    [RegularExpression(@"^[\d\s()+\-.]{8,20}$", ErrorMessage = "Informe um telefone válido.")]
    [Display(Name = "Telefone")]
    public string? Phone { get; set; }

    [Display(Name = "Número aproximado de usuários")]
    public string? UserRange { get; set; }

    [StringLength(2000, ErrorMessage = "Máximo de 2000 caracteres.")]
    [Display(Name = "Mensagem")]
    public string? Message { get; set; }

    /// <summary>Origem: "contato" (padrão) ou "demonstracao".</summary>
    public string Source { get; set; } = "contato";
}
