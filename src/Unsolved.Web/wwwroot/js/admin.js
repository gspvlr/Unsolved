/* =============================================================
   admin.js — Interações da área demonstrativa (painel)
   - Abrir/fechar a barra lateral no mobile
   - Contadores animados dos KPIs
   - Filtro de tabela por status (client-side)
   Respeita prefers-reduced-motion nos contadores.
   ============================================================= */
(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Barra lateral (mobile) ---------- */
    (function sidebar() {
        const toggle = document.getElementById("admin-menu-toggle");
        const bar = document.getElementById("admin-sidebar");
        if (!toggle || !bar) return;
        toggle.addEventListener("click", function () {
            const open = bar.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(open));
        });
        // Fecha ao clicar fora, no mobile.
        document.addEventListener("click", function (e) {
            if (window.innerWidth <= 980 && bar.classList.contains("open") &&
                !bar.contains(e.target) && e.target !== toggle) {
                bar.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    })();

    /* ---------- Contadores de KPI ---------- */
    (function counters() {
        const nums = document.querySelectorAll("[data-counter]");
        nums.forEach(function (el) {
            const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
            if (reduceMotion) { el.textContent = target; return; }
            const duration = 1100;
            const start = performance.now();
            function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    })();

    /* ---------- Filtro de tabela por status ---------- */
    (function tableFilter() {
        const chips = document.querySelectorAll(".admin-filters .filter-chip");
        const table = document.querySelector(".js-filter-table");
        if (!chips.length || !table) return;
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        const emptyHint = table.parentElement.querySelector(".empty-hint");

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (c) { c.classList.remove("is-active"); });
                chip.classList.add("is-active");
                const filter = chip.getAttribute("data-filter");
                let visible = 0;
                rows.forEach(function (row) {
                    const show = filter === "all" || row.getAttribute("data-status") === filter;
                    row.style.display = show ? "" : "none";
                    if (show) visible++;
                });
                if (emptyHint) emptyHint.hidden = visible !== 0;
            });
        });
    })();

    /* ---------- Lightbox de fotos de evidência ---------- */
    (function lightbox() {
        const box = document.getElementById("lightbox");
        if (!box) return;
        const img = document.getElementById("lightbox-img");
        const cap = document.getElementById("lightbox-cap");

        function open(full, caption) {
            img.src = full;
            img.alt = caption || "";
            cap.textContent = caption || "";
            box.hidden = false;
            document.body.style.overflow = "hidden";
        }
        function close() {
            box.hidden = true;
            img.src = "";
            document.body.style.overflow = "";
        }

        // Delegação: qualquer elemento .js-lightbox com data-full abre o visor.
        document.addEventListener("click", function (e) {
            const trigger = e.target.closest(".js-lightbox");
            if (trigger) {
                e.preventDefault();
                open(trigger.getAttribute("data-full"), trigger.getAttribute("data-caption"));
                return;
            }
            if (e.target === box || e.target.closest(".lightbox-close")) close();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !box.hidden) close();
        });
    })();
})();
