using Microsoft.AspNetCore.Mvc;
using Unsolved.Services;

namespace Unsolved.Controllers;

/// <summary>
/// Área DEMONSTRATIVA do sistema (protótipo visual do painel administrativo).
/// Usa o layout _AdminLayout e consome dados fictícios do IDemoDataService.
/// A estrutura já separa cada tela em uma action, pronta para receber
/// funcionalidades reais no futuro.
/// </summary>
[Route("sistema")]
public class DemoController : Controller
{
    private readonly IDemoDataService _data;

    public DemoController(IDemoDataService data) => _data = data;

    [HttpGet("")]
    [HttpGet("painel")]
    public IActionResult Dashboard()
    {
        ViewData["Metrics"] = _data.GetMetrics();
        return View(_data.GetCases());
    }

    [HttpGet("casos")]
    public IActionResult Cases() => View(_data.GetCases());

    [HttpGet("casos/{id:int}")]
    public IActionResult CaseDetails(int id)
    {
        var item = _data.GetCase(id);
        if (item is null) return NotFound();
        return View(item);
    }

    [HttpGet("evidencias")]
    public IActionResult Evidence() => View(_data.GetAllEvidence());

    [HttpGet("pessoas")]
    public IActionResult People() => View(_data.GetAllPeople());

    [HttpGet("linha-do-tempo")]
    public IActionResult Timeline() => View(_data.GetCases());

    [HttpGet("mural")]
    public IActionResult Board() => View(_data.GetCases());

    [HttpGet("relatorios")]
    public IActionResult Reports()
    {
        ViewData["Metrics"] = _data.GetMetrics();
        return View(_data.GetCases());
    }

    [HttpGet("configuracoes")]
    public IActionResult Settings() => View();

    [HttpGet("usuarios")]
    public IActionResult Users() => View();
}
