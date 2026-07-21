using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Unsolved.Models.Demo;
using Unsolved.ViewModels;

namespace Unsolved.Controllers;

/// <summary>
/// Autenticação isolada da demonstração. Os perfis são deliberadamente
/// públicos na tela de login e não representam contas de produção.
/// </summary>
[Route("account")]
public class AccountController : Controller
{
    [HttpGet("login")]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewData["DemoProfiles"] = DemoAccessCatalog.Profiles;
        return View(new LoginViewModel { ReturnUrl = returnUrl });
    }

    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        ViewData["DemoProfiles"] = DemoAccessCatalog.Profiles;
        if (!ModelState.IsValid)
            return View(model);

        var profile = DemoAccessCatalog.Validate(model.Email, model.Password);
        if (profile is null)
        {
            ModelState.AddModelError(string.Empty, "Use uma das credenciais demonstrativas exibidas ao lado.");
            return View(model);
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, profile.Id),
            new(ClaimTypes.Name, profile.Name),
            new(ClaimTypes.Email, profile.Email),
            new(ClaimTypes.Role, profile.Id),
            new("profile_title", profile.Title),
            new("access_level", profile.AccessLevel),
        };
        if (profile.AssignedCaseId is not null)
        {
            claims.Add(new("assigned_case_id", profile.AssignedCaseId));
            claims.Add(new("assigned_case_code", profile.AssignedCaseCode!));
            claims.Add(new("assigned_case_title", profile.AssignedCaseTitle!));
        }

        var principal = new ClaimsPrincipal(new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme));
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = model.RememberMe,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(model.RememberMe ? 24 : 8),
            });

        if (!string.IsNullOrWhiteSpace(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl))
            return LocalRedirect(model.ReturnUrl);
        return Redirect("/sistema");
    }

    [Authorize]
    [HttpGet("session")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Session()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "viewer";
        return Json(new
        {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            name = User.Identity?.Name,
            email = User.FindFirstValue(ClaimTypes.Email),
            role,
            title = User.FindFirstValue("profile_title"),
            accessLevel = User.FindFirstValue("access_level"),
            assignedCaseId = User.FindFirstValue("assigned_case_id"),
            assignedCaseCode = User.FindFirstValue("assigned_case_code"),
            assignedCaseTitle = User.FindFirstValue("assigned_case_title"),
            permissions = new
            {
                manageAll = role == "admin",
                editAssignedCase = role is "admin" or "detective",
                readOnly = role == "viewer",
            },
        });
    }

    [HttpGet("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction(nameof(Login));
    }
}
