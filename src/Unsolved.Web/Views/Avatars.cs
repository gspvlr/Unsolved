using System.Text;

namespace Unsolved.Views;

/// <summary>
/// Avatares "de desenho" gerados em SVG, determinísticos por semente (nome).
/// Sem dependência externa e sem arquivos: a mesma pessoa gera sempre a mesma
/// cara. Usados para investigadores, vítimas, suspeitos e testemunhas na demo.
/// ponytail: retrato procedural simples (paleta + cabelo + acessório por hash).
/// Se um dia quiser fotos reais, troque as chamadas por &lt;img&gt;.
/// </summary>
public static class Avatars
{
    static readonly string[] Bg   = { "#3b2f1a", "#43331f", "#2f3a30", "#39303f", "#2c3542", "#483420" };
    static readonly string[] Skin = { "#f2c9a0", "#e3b184", "#cf9366", "#b0764c", "#8f5f3d", "#f6d8bd" };
    static readonly string[] Hair = { "#2b2b2b", "#5a3a1e", "#8a6a3a", "#c9c1b4", "#e6cf8f", "#7a4326" };
    static readonly string[] Cloth = { "#6b4a17", "#4a5a6b", "#5a4a4a", "#3f5a3f", "#6b5a2a", "#514a5f" };

    /// <summary>Retorna um &lt;svg&gt; inline (100x100) com o retrato da pessoa.</summary>
    public static string Portrait(string seed)
    {
        int h = Hash(seed);
        string bg    = Bg[h % Bg.Length];
        string skin  = Skin[(h / 7) % Skin.Length];
        string hair  = Hair[(h / 13) % Hair.Length];
        string cloth = Cloth[(h / 31) % Cloth.Length];
        int hairStyle = (h / 17) % 4;
        int accessory = (h / 23) % 4;   // 0 nada · 1 óculos · 2 bigode · 3 barba

        var sb = new StringBuilder();
        sb.Append($"<svg class='avatar-svg' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='Retrato ilustrativo'>");
        sb.Append($"<circle cx='50' cy='50' r='50' fill='{bg}'/>");
        // Busto / roupa
        sb.Append($"<path d='M16 100 C16 78 33 70 50 70 C67 70 84 78 84 100 Z' fill='{cloth}'/>");
        // Pescoço + cabeça
        sb.Append($"<rect x='44' y='58' width='12' height='16' rx='4' fill='{skin}'/>");
        sb.Append($"<ellipse cx='50' cy='44' rx='22' ry='24' fill='{skin}'/>");
        // Orelhas
        sb.Append($"<circle cx='28' cy='46' r='4' fill='{skin}'/><circle cx='72' cy='46' r='4' fill='{skin}'/>");
        // Barba (atrás dos traços do rosto)
        if (accessory == 3)
            sb.Append($"<path d='M30 46 C30 66 40 70 50 70 C60 70 70 66 70 46 C66 58 58 62 50 62 C42 62 34 58 30 46 Z' fill='{hair}' opacity='.92'/>");
        // Cabelo
        sb.Append(HairPath(hairStyle, hair));
        // Olhos + sobrancelhas
        sb.Append("<circle cx='42' cy='45' r='2.6' fill='#241d0d'/><circle cx='58' cy='45' r='2.6' fill='#241d0d'/>");
        sb.Append("<path d='M38 39 Q42 37 46 39M54 39 Q58 37 62 39' stroke='#241d0d' stroke-width='1.4' fill='none' stroke-linecap='round'/>");
        // Nariz + boca
        sb.Append("<path d='M50 47 L50 53 M47 54 Q50 56 53 54' stroke='#00000055' stroke-width='1.3' fill='none' stroke-linecap='round'/>");
        sb.Append("<path d='M44 59 Q50 63 56 59' stroke='#7a3b2e' stroke-width='1.8' fill='none' stroke-linecap='round'/>");
        // Bigode
        if (accessory == 2)
            sb.Append($"<path d='M43 57 Q50 60 57 57 Q50 62 43 57 Z' fill='{hair}'/>");
        // Óculos
        if (accessory == 1)
            sb.Append("<g stroke='#241d0d' stroke-width='1.6' fill='none'><circle cx='42' cy='45' r='6'/><circle cx='58' cy='45' r='6'/><path d='M48 45 h4M36 44 l-5-1M64 44 l5-1'/></g>");
        sb.Append("</svg>");
        return sb.ToString();
    }

    static string HairPath(int style, string hair) => style switch
    {
        // curto arredondado
        0 => $"<path d='M26 44 C26 22 74 22 74 44 C71 32 64 26 50 26 C36 26 29 32 26 44 Z' fill='{hair}'/>",
        // risca lateral
        1 => $"<path d='M26 46 C25 22 75 22 74 46 C70 30 58 26 45 28 C39 24 30 28 26 46 Z' fill='{hair}'/>",
        // longo (emoldura as laterais)
        2 => $"<path d='M24 60 C21 24 79 24 76 60 L76 48 C74 34 64 26 50 26 C36 26 26 34 24 48 Z' fill='{hair}'/>",
        // curto/raspado
        _ => $"<path d='M28 43 C28 25 72 25 72 43 C69 34 63 29 50 29 C37 29 31 34 28 43 Z' fill='{hair}' opacity='.9'/>",
    };

    static int Hash(string? s)
    {
        int h = 5381;
        foreach (char c in s ?? "") h = ((h << 5) + h + c) & 0x7fffffff;
        return h;
    }
}
