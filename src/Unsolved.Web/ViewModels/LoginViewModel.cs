using System.ComponentModel.DataAnnotations;

namespace Unsolved.ViewModels;

/// <summary>
/// Formulário de login DEMONSTRATIVO. Não autentica de verdade — apenas
/// valida o formato dos campos e leva o usuário ao painel de demonstração.
/// </summary>
public class LoginViewModel
{
    [Required(ErrorMessage = "Informe seu e-mail.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [Display(Name = "E-mail")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe sua senha.")]
    [DataType(DataType.Password)]
    [Display(Name = "Senha")]
    public string Password { get; set; } = string.Empty;

    [Display(Name = "Manter conectado")]
    public bool RememberMe { get; set; }
}
