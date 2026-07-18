namespace Unsolved.Views;

/// <summary>
/// Ícones SVG inline, reutilizados pelas views (sem biblioteca externa).
/// Usam currentColor, então herdam a cor do contexto CSS.
/// </summary>
public static class Icons
{
    public static string Svg(string name) => name switch
    {
        "scatter" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='5' cy='6' r='2'/><circle cx='19' cy='7' r='2'/><circle cx='12' cy='18' r='2'/><path d='M6.6 7.2 10.6 16M17.6 8.4 13.2 16.6'/></svg>",
        "box" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M3 7l9-4 9 4-9 4-9-4Z'/><path d='M3 7v10l9 4 9-4V7'/><path d='M12 11v10'/></svg>",
        "team" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='9' cy='8' r='3'/><path d='M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6'/><path d='M16 4.5a3 3 0 0 1 0 6M21 20c0-2.5-1.5-4.6-3.6-5.5'/></svg>",
        "clock" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 3'/></svg>",
        "alert" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M12 3 2 21h20L12 3Z'/><path d='M12 10v4M12 17.5v.5'/></svg>",
        "chart" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M4 20V4M4 20h16'/><rect x='7' y='11' width='3' height='6'/><rect x='12' y='7' width='3' height='10'/><rect x='17' y='13' width='3' height='4'/></svg>",
        "folder" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z'/></svg>",
        "pin" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z'/><circle cx='12' cy='10' r='2.5'/></svg>",
        "timeline" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M5 3v18'/><circle cx='5' cy='8' r='2'/><circle cx='5' cy='16' r='2'/><path d='M7 8h12M7 16h9'/></svg>",
        "report" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M6 2h9l5 5v15H6Z'/><path d='M14 2v6h6M9 13h6M9 17h6'/></svg>",
        "bell" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z'/><path d='M10 20a2 2 0 0 0 4 0'/></svg>",
        "lock" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><rect x='5' y='11' width='14' height='9' rx='2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/></svg>",
        "audit" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M6 2h9l5 5v15H6Z'/><path d='M14 2v6h6'/><path d='m9 15 2 2 4-4'/></svg>",
        "search" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='11' cy='11' r='6'/><path d='m20 20-3.5-3.5'/></svg>",
        "shield" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><path d='M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z'/><path d='m9 12 2 2 4-4'/></svg>",
        "key" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='8' cy='8' r='4'/><path d='m11 11 9 9M17 17l2-2M14 14l2-2'/></svg>",
        "database" => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><ellipse cx='12' cy='5' rx='7' ry='3'/><path d='M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5'/><path d='M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3'/></svg>",
        _ => "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6'><circle cx='12' cy='12' r='9'/></svg>",
    };
}

/// <summary>Helpers visuais da área demonstrativa.</summary>
public static class DemoUi
{
    /// <summary>Classe CSS do "badge" de status de caso.</summary>
    public static string StatusClass(string status) => status switch
    {
        "Em andamento" => "st-open",
        "Em reabertura" => "st-review",
        "Resolvido" => "st-solved",
        _ => "st-cold",   // Arquivado
    };
}
