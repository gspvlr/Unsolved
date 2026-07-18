using Unsolved.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Serviços (injeção de dependência)
// ---------------------------------------------------------------------------
builder.Services.AddControllersWithViews();

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
app.UseStaticFiles();   // serve wwwroot (css, js, imagens)
app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
