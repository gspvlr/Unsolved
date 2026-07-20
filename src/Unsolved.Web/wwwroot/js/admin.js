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

    /* ---------- Busca (topbar) + filtro por status (compõem) ----------
       A busca da topbar filtra as linhas de qualquer .data-table da página
       atual por texto; os chips de status (só na tela de Casos) compõem com
       ela. ponytail: busca client-side na página corrente; busca global
       cross-tela exige endpoint no servidor — trocar quando existir backend. */
    (function tableSearchAndFilter() {
        const tables = Array.from(document.querySelectorAll(".data-table"));
        const grids = Array.from(document.querySelectorAll(".people-grid"));
        if (!tables.length && !grids.length) return;
        const searchInput = document.querySelector(".admin-search input");

        let term = "";
        let status = "all";

        function refresh() {
            tables.forEach(function (table) {
                let visible = 0;
                table.querySelectorAll("tbody tr").forEach(function (row) {
                    const rowStatus = row.getAttribute("data-status");
                    const okText = term === "" || row.textContent.toLowerCase().includes(term);
                    const okStatus = status === "all" || !rowStatus || rowStatus === status;
                    const show = okText && okStatus;
                    row.style.display = show ? "" : "none";
                    if (show) visible++;
                });
                const hint = table.parentElement.querySelector(".empty-hint");
                if (hint) hint.hidden = visible !== 0;
            });
            // Grades de cards (ex.: Pessoas) — só filtro por texto.
            grids.forEach(function (grid) {
                let visible = 0;
                grid.querySelectorAll(":scope > article").forEach(function (card) {
                    const show = term === "" || card.textContent.toLowerCase().includes(term);
                    card.style.display = show ? "" : "none";
                    if (show) visible++;
                });
                const hint = grid.parentElement.querySelector(".empty-hint");
                if (hint) hint.hidden = visible !== 0;
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                term = searchInput.value.trim().toLowerCase();
                refresh();
            });
        }

        const chips = document.querySelectorAll(".admin-filters .filter-chip");
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (c) { c.classList.remove("is-active"); });
                chip.classList.add("is-active");
                status = chip.getAttribute("data-filter");
                refresh();
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
