using Microsoft.AspNetCore.Mvc;
using Unsolved.ViewModels;

namespace Unsolved.Controllers;

/// <summary>
/// Login DEMONSTRATIVO. Não há autenticação real: valida o formato dos campos
/// e, se estiver ok, encaminha para o painel de demonstração.
/// ponytail: sem Identity/cookies — só um fluxo visual. Adicionar autenticação
/// de verdade (ASP.NET Core Identity) quando houver back-end de usuários.
/// </summary>
public class AccountController : Controller
{
    [HttpGet]
    public IActionResult Login() => View(new LoginViewModel());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        // Demonstração: qualquer credencial válida no formato leva ao painel.
        return RedirectToAction("Dashboard", "Demo");
    }
}
