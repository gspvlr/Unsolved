/* =============================================================
   menu.js — Menu mobile (hambúrguer)
   Abre/fecha a navegação principal em telas pequenas.
   ============================================================= */
(function () {
    "use strict";

    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    toggle.addEventListener("click", function () {
        setOpen(!nav.classList.contains("open"));
    });

    // Fecha ao clicar em um link do menu.
    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () { setOpen(false); });
    });

    // Fecha com a tecla ESC (acessibilidade).
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("open")) {
            setOpen(false);
            toggle.focus();
        }
    });

    // Fecha ao redimensionar para desktop (mesmo breakpoint do CSS: 1180px).
    window.addEventListener("resize", function () {
        if (window.innerWidth > 1180) setOpen(false);
    });
})();
