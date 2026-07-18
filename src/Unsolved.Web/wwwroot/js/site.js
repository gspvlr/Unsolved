/* =============================================================
   site.js — Inicialização geral do site público
   - Estado "scrolled" do cabeçalho fixo
   - Easter egg: clicar várias vezes na logo revela mensagem secreta
   ============================================================= */
(function () {
    "use strict";

    /* ---------- Cabeçalho muda ao rolar ---------- */
    (function stickyHeader() {
        const header = document.getElementById("site-header");
        if (!header) return;
        function update() { header.classList.toggle("is-scrolled", window.scrollY > 20); }
        update();
        window.addEventListener("scroll", update, { passive: true });
    })();

    /* ---------- Easter egg da logo ---------- */
    (function logoEasterEgg() {
        const logo = document.getElementById("brand-logo");
        if (!logo) return;
        // Ouve a MARCA inteira (logo + nome), não só a imagem.
        const brand = logo.closest("a") || logo;
        const href = brand.getAttribute("href") || "/";

        let clicks = 0;
        let timer = null;

        // Mensagem secreta revelada aos 5 cliques.
        const secret = "🔍 Caso Nº UNS-000: você encontrou a pista secreta. A investigação continua…";

        brand.addEventListener("click", function (e) {
            // Sempre segura o clique: decidimos no fim se navega (1 clique) ou é easter egg (5).
            e.preventDefault();
            clicks++;
            clearTimeout(timer);

            if (clicks >= 5) {
                clicks = 0;
                revealSecret(secret);
                if (window.Unsolved && window.Unsolved.showStamp) window.Unsolved.showStamp();
                // Conta como um dos segredos da caça (Missão 3).
                if (window.Unsolved && window.Unsolved.foundSecret) window.Unsolved.foundSecret("logo");
                return;
            }

            // Se parou em 1 clique, comporta-se como link normal (vai pra home).
            timer = setTimeout(function () {
                if (clicks === 1) window.location.href = href;
                clicks = 0;
            }, 450);
        });

        function revealSecret(text) {
            let toast = document.getElementById("secret-toast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "secret-toast";
                toast.setAttribute("role", "status");
                toast.style.cssText =
                    "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:500;" +
                    "background:#201D12;color:#F0D86D;border:1px solid rgba(240,216,109,.5);" +
                    "padding:14px 22px;border-radius:10px;font-family:'Courier New',monospace;" +
                    "box-shadow:0 18px 44px rgba(0,0,0,.5);max-width:90vw;text-align:center;" +
                    "opacity:0;transition:opacity .4s ease;";
                document.body.appendChild(toast);
            }
            toast.textContent = text;
            requestAnimationFrame(function () { toast.style.opacity = "1"; });
            clearTimeout(toast._t);
            toast._t = setTimeout(function () { toast.style.opacity = "0"; }, 5000);
        }

        // Expõe o "toast" de detetive para outros scripts (mystery.js) reutilizarem.
        window.Unsolved = window.Unsolved || {};
        window.Unsolved.toast = revealSecret;
    })();
})();
