using Microsoft.AspNetCore.Mvc;
using Unsolved.Models;
using Unsolved.Services;
using Unsolved.ViewModels;

namespace Unsolved.Controllers;

/// <summary>
/// Recebe os envios do formulário de contato / solicitação de demonstração.
/// Responde em JSON para permitir sucesso sem recarregar a página (AJAX).
/// A VALIDAÇÃO DE SERVIDOR acontece aqui (ModelState + anotações do ViewModel).
/// </summary>
[Route("contato")]
public class ContactController : Controller
{
    private readonly IContactService _contacts;

    public ContactController(IContactService contacts) => _contacts = contacts;

    [HttpPost("enviar")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit([FromForm] ContactViewModel model)
    {
        // Validação no servidor. Se falhar, devolve os erros por campo em JSON.
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(kvp => kvp.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(new { success = false, errors });
        }

        // Persiste (hoje em memória/log) e gera o protocolo.
        var protocol = await _contacts.SaveAsync(new ContactMessage
        {
            Name = model.Name.Trim(),
            Organization = model.Organization.Trim(),
            Role = model.Role?.Trim(),
            Email = model.Email.Trim(),
            Phone = model.Phone?.Trim(),
            UserRange = model.UserRange,
            Message = model.Message?.Trim(),
            Source = model.Source
        });

        return Ok(new
        {
            success = true,
            protocol,
            message = "Recebemos sua solicitação. Nossa equipe entrará em contato em breve."
        });
    }
}
