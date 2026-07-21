using Microsoft.AspNetCore.Mvc;

namespace Unsolved.Controllers;

/// <summary>
/// Área do sistema (/sistema): serve o SPA "Unsolved OS" (wwwroot/app).
/// Toda a lógica, dados (IndexedDB) e roteamento ficam no cliente. Qualquer
/// subcaminho de /sistema devolve o shell — o roteador por hash resolve a tela.
/// </summary>
[Route("sistema")]
public class DemoController : Controller
{
    private readonly IWebHostEnvironment _env;

    public DemoController(IWebHostEnvironment env) => _env = env;

    [HttpGet("")]
    [HttpGet("{**rest}")]
    public IActionResult App()
    {
        var path = Path.Combine(_env.WebRootPath, "app", "index.html");
        return PhysicalFile(path, "text/html");
    }
}
