using Microsoft.AspNetCore.Authentication.Cookies;
using Unsolved.Services;

var builder = WebApplication.CreateBuilder(args);

// Se a variável de ambiente PORT estiver definida (ex.: ferramenta de preview,
// Docker ou PaaS), a aplicação escuta nessa porta. Caso contrário, usa o padrão
// (launchSettings / --urls). Isso permite porta atribuída automaticamente.
var assignedPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(assignedPort))
{
    // 0.0.0.0 (não localhost) para ser acessível de fora do contêiner.
    builder.WebHost.UseUrls($"http://0.0.0.0:{assignedPort}");
}

// ---------------------------------------------------------------------------
// Serviços (injeção de dependência)
// ---------------------------------------------------------------------------
builder.Services.AddControllersWithViews();
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "unsolved.demo.session";
        options.LoginPath = "/account/login";
        options.AccessDeniedPath = "/account/login";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
    });
builder.Services.AddAuthorization();

// Serviço de contato: hoje grava as mensagens em memória / log.
// Amanhã, basta trocar a implementação por uma que persista no SQL Server,
// sem alterar os controllers (dependem apenas da interface IContactService).
builder.Services.AddSingleton<IContactService, ContactService>();

// Serviço de dados de demonstração da área administrativa (dados fictícios).
// Também isolado atrás de uma interface para facilitar a substituição futura
// por uma camada de acesso a dados real (Entity Framework Core + SQL Server).
builder.Services.AddSingleton<IDemoDataService, DemoDataService>();

var app = builder.Build();

// ---------------------------------------------------------------------------
// Pipeline HTTP
// ---------------------------------------------------------------------------
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Página de erro personalizada para códigos de status (ex.: 404).
app.UseStatusCodePagesWithReExecute("/Home/StatusCodeError", "?code={0}");

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    // O SPA em /app é atualizado com frequência: força revalidação (ETag)
    // para que novas versões dos módulos ES cheguem ao cliente sem cache preso.
    OnPrepareResponse = ctx =>
    {
        if (ctx.Context.Request.Path.StartsWithSegments("/app"))
            ctx.Context.Response.Headers.CacheControl = "no-cache, must-revalidate";
    }
});
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
