using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Unsolved.Models;

namespace Unsolved.Controllers;

/// <summary>
/// Controller das páginas públicas (institucionais/comerciais).
/// Cada action apenas devolve uma View — o conteúdo é estático/comercial.
/// </summary>
public class HomeController : Controller
{
    // Página inicial (hero, problemas, solução, como funciona, funcionalidades,
    // segurança, público-alvo, diferenciais, demonstração, depoimentos, FAQ, CTA, contato).
    public IActionResult Index() => View();

    // URLs "limpas" via roteamento por atributo (ex.: /sobre em vez de /Home/Sobre).
    [Route("sobre")] public IActionResult Sobre() => View();
    [Route("recursos")] public IActionResult Recursos() => View();
    [Route("seguranca")] public IActionResult Seguranca() => View();
    [Route("contato")] public IActionResult Contato() => View();
    [Route("solicitar-demonstracao")] public IActionResult SolicitarDemonstracao() => View();
    [Route("privacidade")] public IActionResult Privacidade() => View();
    [Route("termos")] public IActionResult Termos() => View();

    // Gabarito escondido da caça aos segredos (não linkado no menu/rodapé).
    [Route("segredos")] public IActionResult Segredos() => View();

    // -----------------------------------------------------------------------
    // Tratamento de erros
    // -----------------------------------------------------------------------

    /// <summary>Página de erro genérica (exceções não tratadas em produção).</summary>
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        var model = new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
            StatusCode = 500
        };
        return View(model);
    }

    /// <summary>Página 404/erro de status personalizada.</summary>
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult StatusCodeError(int code)
    {
        Response.StatusCode = code;
        var model = new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
            StatusCode = code
        };
        // Uma view dedicada para 404; demais códigos caem na mesma view.
        return View("StatusCode", model);
    }
}
