/* =============================================================
   demo.js — Explorador de casos da seção "Demonstração" (home)
   Filtra casos por status e mostra o detalhe do caso selecionado.
   Dados vêm dos atributos data-* de cada item (renderizados no Razor).
   ============================================================= */
(function () {
    "use strict";

    const explorer = document.getElementById("demo-explorer");
    if (!explorer) return;

    const list = explorer.querySelector("#demo-caselist");
    const detail = explorer.querySelector("#demo-detail");
    const chips = explorer.querySelectorAll(".filter-chip");
    const items = Array.from(explorer.querySelectorAll(".demo-caseitem"));

    // Escapa texto para evitar injeção ao montar HTML.
    function esc(s) {
        return String(s || "").replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function statusBadgeClass(status) {
        if (status === "Em andamento") return "st-open";
        if (status === "Em reabertura") return "st-review";
        if (status === "Resolvido") return "st-solved";
        return "st-cold";   // Arquivado
    }

    // Monta o painel de detalhe a partir dos data-* do botão.
    function renderDetail(btn) {
        const d = btn.dataset;
        const steps = (d.timeline || "").split("→").map(function (s) { return s.trim(); }).filter(Boolean);
        const tl = steps.map(function (s) { return esc(s); }).join(" <span style='color:var(--gold)'>→</span> ");

        detail.innerHTML =
            '<div class="demo-detail-head">' +
                '<div>' +
                    '<span class="status-badge ' + statusBadgeClass(d.status) + '">' + esc(d.status) + '</span>' +
                    '<h3 class="mono">' + esc(d.number) + '</h3>' +
                    '<p class="muted" style="margin:0">' + esc(d.name) + '</p>' +
                '</div>' +
            '</div>' +
            '<div class="demo-detail-grid">' +
                '<div><span>Investigador responsável</span><strong>' + esc(d.lead) + '</strong></div>' +
                '<div><span>Evidências cadastradas</span><strong>' + esc(d.evidence) + '</strong></div>' +
                '<div><span>Suspeitos relacionados</span><strong>' + esc(d.suspects) + '</strong></div>' +
                '<div><span>Progresso</span><strong>' + esc(d.progress) + '%</strong></div>' +
            '</div>' +
            '<div class="progress progress-lg"><span style="width:' + Number(d.progress) + '%"></span></div>' +
            '<p style="margin:16px 0 6px;font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-dim)">Linha do tempo</p>' +
            '<div class="demo-detail-tl">' + tl + '</div>';
    }

    function select(btn) {
        items.forEach(function (b) { b.classList.remove("is-selected"); });
        btn.classList.add("is-selected");
        renderDetail(btn);
    }

    // Clique em um caso.
    items.forEach(function (btn) {
        btn.addEventListener("click", function () { select(btn); });
    });

    // Filtro por status.
    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (c) { c.classList.remove("is-active"); });
            chip.classList.add("is-active");
            const filter = chip.getAttribute("data-filter");
            let firstVisible = null;
            items.forEach(function (btn) {
                const li = btn.parentElement;
                const show = filter === "all" || btn.getAttribute("data-status") === filter;
                li.style.display = show ? "" : "none";
                if (show && !firstVisible) firstVisible = btn;
            });
            // Seleciona automaticamente o primeiro caso visível do filtro.
            if (firstVisible) select(firstVisible);
        });
    });

    // Estado inicial: mostra o detalhe do primeiro caso.
    if (items.length) select(items[0]);
})();
